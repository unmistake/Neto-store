"use client";

import { useCart } from "@/components/CartProvider";
import type {
  CheckoutAddress,
  CheckoutCustomer,
  CheckoutDeliveryMethod,
  CheckoutPaymentMethod,
  CheckoutValidation,
} from "@/lib/checkout";
import { formatMoney, productMeasure } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Step = 1 | 2 | 3 | 4;

const steps = [
  { id: 1, label: "Identificação" },
  { id: 2, label: "Entrega" },
  { id: 3, label: "Pagamento" },
  { id: 4, label: "Revisão" },
] as const;

const inputClass =
  "mt-2 w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-3.5 text-base font-bold outline-none transition focus:border-[color:var(--brand)] focus:ring-4 focus:ring-orange-100";

function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

function formatZip(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{2})(\d)/, "$1 $2")
    .replace(/^(\d{2}) (\d{5})(\d)/, "$1 $2-$3");
}

function StepHeading({
  number,
  title,
  description,
}: {
  number: Step;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[color:var(--brand)]">
        Etapa {number} de 4
      </p>
      <h2 className="display-font mt-2 text-3xl font-black sm:text-4xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
        {description}
      </p>
    </div>
  );
}

function ChoiceCard({
  selected,
  title,
  description,
  tag,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  tag?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start justify-between gap-4 rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-[color:var(--brand)] bg-orange-50 ring-2 ring-orange-100"
          : "border-[color:var(--line)] bg-white/70 hover:bg-white"
      }`}
    >
      <span>
        <span className="font-black">{title}</span>
        <span className="mt-2 block text-sm leading-6 text-[color:var(--muted)]">
          {description}
        </span>
      </span>
      {tag ? (
        <span className="shrink-0 rounded-full bg-[color:var(--night)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
          {tag}
        </span>
      ) : null}
    </button>
  );
}

export function CheckoutFlow({
  initialCustomer,
  initialAddress,
  isAuthenticated,
}: {
  initialCustomer: CheckoutCustomer;
  initialAddress: CheckoutAddress;
  isAuthenticated: boolean;
}) {
  const { items } = useCart();
  const [step, setStep] = useState<Step>(1);
  const [customer, setCustomer] = useState(initialCustomer);
  const [deliveryMethod, setDeliveryMethod] =
    useState<CheckoutDeliveryMethod>("delivery");
  const [address, setAddress] = useState<CheckoutAddress>(initialAddress);
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("pix");
  const [validation, setValidation] = useState<CheckoutValidation | null>(null);
  const [validating, setValidating] = useState(true);
  const [cepLoading, setCepLoading] = useState(false);
  const [error, setError] = useState("");
  const [prepared, setPrepared] = useState(false);

  useEffect(() => {
    let active = true;

    async function validateCart() {
      if (items.length === 0) {
        setValidation(null);
        setValidating(false);
        return;
      }

      setValidating(true);
      try {
        const response = await fetch("/api/checkout/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              product_id: item.product.id,
              quantity: item.quantity,
            })),
          }),
        });
        const payload = (await response.json()) as CheckoutValidation;
        if (active) setValidation(payload);
      } catch {
        if (active) {
          setValidation({
            ok: false,
            items: [],
            subtotal: 0,
            issues: ["Não foi possível conferir o estoque agora. Tente novamente."],
          });
        }
      } finally {
        if (active) setValidating(false);
      }
    }

    validateCart();
    return () => {
      active = false;
    };
  }, [items]);

  const currentStepIndex = steps.findIndex((item) => item.id === step);
  const validatedItems = validation?.items || [];
  const subtotal = validation?.subtotal || 0;
  const addressSummary = useMemo(
    () =>
      [
        `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""}`,
        address.district,
        `${address.city} - ${address.state}`,
        address.zip,
      ]
        .filter(Boolean)
        .join(" · "),
    [address],
  );

  function updateCustomer(field: keyof CheckoutCustomer, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function updateAddress(field: keyof CheckoutAddress, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function findCep(zip: string) {
    const cep = onlyDigits(zip);
    if (cep.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data?.erro) {
        setError("CEP não encontrado. Preencha o endereço manualmente.");
        return;
      }
      setAddress((current) => ({
        ...current,
        street: data.logradouro || current.street,
        district: data.bairro || current.district,
        city: data.localidade || current.city,
        state: data.uf || current.state,
      }));
      setError("");
    } catch {
      setError("Não foi possível consultar o CEP. Preencha o endereço manualmente.");
    } finally {
      setCepLoading(false);
    }
  }

  function validateCurrentStep(): boolean {
    setError("");

    if (step === 1) {
      if (
        !customer.first_name.trim() ||
        !customer.last_name.trim() ||
        !customer.email.trim() ||
        !customer.phone.trim()
      ) {
        setError("Preencha nome, sobrenome, e-mail e telefone para continuar.");
        return false;
      }
      if (!customer.email.includes("@")) {
        setError("Informe um e-mail válido.");
        return false;
      }
    }

    if (step === 2 && deliveryMethod === "delivery") {
      if (
        onlyDigits(address.zip).length !== 8 ||
        !address.street.trim() ||
        !address.number.trim() ||
        !address.district.trim() ||
        !address.city.trim() ||
        address.state.trim().length !== 2
      ) {
        setError("Complete o endereço de entrega para continuar.");
        return false;
      }
    }

    return true;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(4, current + 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previousStep() {
    setError("");
    setStep((current) => Math.max(1, current - 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!validating && items.length === 0) {
    return (
      <main className="texture min-h-screen px-4 py-10 sm:px-6">
        <section className="mx-auto max-w-3xl rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--card)] p-10 text-center card-shadow sm:p-16">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[color:var(--brand)]">
            Checkout
          </p>
          <h1 className="display-font mt-3 text-4xl font-black sm:text-5xl">
            Seu carrinho está vazio
          </h1>
          <p className="mt-4 text-[color:var(--muted)]">
            Escolha os produtos antes de iniciar a finalização.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex rounded-2xl bg-[color:var(--brand)] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-white"
          >
            Voltar para a loja
          </Link>
        </section>
      </main>
    );
  }

  if (prepared) {
    return (
      <main className="texture min-h-screen px-4 py-10 sm:px-6">
        <section className="mx-auto max-w-3xl overflow-hidden rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--card)] card-shadow">
          <div className="bg-[color:var(--night)] p-8 text-white sm:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand)] text-3xl">
              ✓
            </div>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.26em] text-orange-200">
              Checkout validado
            </p>
            <h1 className="display-font mt-3 text-4xl font-black sm:text-6xl">
              Tudo pronto para o pagamento.
            </h1>
            <p className="mt-5 max-w-2xl leading-7 text-stone-300">
              Seus dados, endereço e produtos foram revisados. Nenhuma cobrança foi
              realizada e o estoque ainda não foi baixado.
            </p>
          </div>
          <div className="p-8 sm:p-12">
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 text-orange-950">
              A próxima integração conectará esta etapa ao gateway de pagamento.
              Depois da confirmação financeira, o pedido será enviado ao ERP
              automaticamente.
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setPrepared(false)}
                className="rounded-2xl border border-[color:var(--line)] px-6 py-4 text-sm font-black uppercase tracking-[0.12em]"
              >
                Voltar à revisão
              </button>
              <Link
                href="/"
                className="rounded-2xl bg-[color:var(--night)] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-white"
              >
                Continuar na loja
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="texture min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/carrinho"
              className="text-xs font-black uppercase tracking-[0.2em] text-[color:var(--brand)]"
            >
              ← Voltar ao carrinho
            </Link>
            <h1 className="display-font mt-3 text-4xl font-black sm:text-6xl">
              Finalizar pedido
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-[color:var(--muted)]">
            Os preços e a disponibilidade são conferidos diretamente no ERP.
          </p>
        </div>

        <nav
          aria-label="Etapas do checkout"
          className="mb-6 overflow-x-auto rounded-[2rem] border border-[color:var(--line)] bg-white/65 p-2"
        >
          <ol className="grid min-w-[620px] grid-cols-4 gap-2">
            {steps.map((item, index) => {
              const active = item.id === step;
              const complete = index < currentStepIndex;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (complete) {
                        setError("");
                        setStep(item.id);
                      }
                    }}
                    disabled={!complete}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ${
                      active
                        ? "bg-[color:var(--night)] text-white"
                        : complete
                          ? "bg-orange-50 text-[color:var(--brand)]"
                          : "text-[color:var(--muted)]"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        active || complete
                          ? "bg-[color:var(--brand)] text-white"
                          : "bg-stone-200"
                      }`}
                    >
                      {complete ? "✓" : item.id}
                    </span>
                    <span className="text-xs font-black uppercase tracking-[0.12em]">
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="rounded-[2.5rem] border border-[color:var(--line)] bg-[color:var(--card)] p-5 card-shadow sm:p-8">
            {step === 1 ? (
              <CustomerStep
                customer={customer}
                isAuthenticated={isAuthenticated}
                updateCustomer={updateCustomer}
              />
            ) : null}
            {step === 2 ? (
              <DeliveryStep
                deliveryMethod={deliveryMethod}
                setDeliveryMethod={setDeliveryMethod}
                address={address}
                updateAddress={updateAddress}
                findCep={findCep}
                cepLoading={cepLoading}
              />
            ) : null}
            {step === 3 ? (
              <PaymentStep
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
            ) : null}
            {step === 4 ? (
              <ReviewStep
                customer={customer}
                deliveryMethod={deliveryMethod}
                addressSummary={addressSummary}
                paymentMethod={paymentMethod}
                setStep={setStep}
              />
            ) : null}

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
                {error}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[color:var(--line)] pt-6 sm:flex-row sm:justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={previousStep}
                  className="rounded-2xl border border-[color:var(--line)] px-6 py-4 text-sm font-black uppercase tracking-[0.12em]"
                >
                  Voltar
                </button>
              ) : (
                <span />
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="rounded-2xl bg-[color:var(--brand)] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[color:var(--brand-dark)]"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (validation?.ok) setPrepared(true);
                  }}
                  disabled={!validation?.ok}
                  className="rounded-2xl bg-[color:var(--brand)] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-[color:var(--brand-dark)] disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  Preparar pagamento
                </button>
              )}
            </div>
          </section>

          <OrderSummary
            validating={validating}
            validation={validation}
            subtotal={subtotal}
            deliveryMethod={deliveryMethod}
          />
        </div>
      </section>
    </main>
  );
}

function CustomerStep({
  customer,
  isAuthenticated,
  updateCustomer,
}: {
  customer: CheckoutCustomer;
  isAuthenticated: boolean;
  updateCustomer: (field: keyof CheckoutCustomer, value: string) => void;
}) {
  return (
    <div>
      <StepHeading
        number={1}
        title="Quem está comprando?"
        description="Usaremos estes dados para contato, acompanhamento e documentos do pedido."
      />
      {isAuthenticated ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
          Você está conectado. Preenchemos os dados disponíveis na sua conta.
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-4 text-sm">
          <span className="font-semibold text-[color:var(--muted)]">
            Já possui cadastro?
          </span>
          <Link href="/login?next=/checkout" className="font-black text-[color:var(--brand)]">
            Entrar na conta
          </Link>
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <CheckoutInput
          label="Nome"
          value={customer.first_name}
          onChange={(value) => updateCustomer("first_name", value)}
          autoComplete="given-name"
        />
        <CheckoutInput
          label="Sobrenome"
          value={customer.last_name}
          onChange={(value) => updateCustomer("last_name", value)}
          autoComplete="family-name"
        />
        <CheckoutInput
          label="E-mail"
          value={customer.email}
          onChange={(value) => updateCustomer("email", value)}
          type="email"
          autoComplete="email"
        />
        <CheckoutInput
          label="Telefone"
          value={customer.phone}
          onChange={(value) => updateCustomer("phone", formatPhone(value))}
          autoComplete="tel"
          inputMode="numeric"
        />
        <div className="sm:col-span-2">
          <CheckoutInput
            label="CPF/CNPJ"
            value={customer.tax_id}
            onChange={(value) => updateCustomer("tax_id", value)}
            placeholder="Opcional nesta etapa"
            inputMode="numeric"
          />
        </div>
      </div>
    </div>
  );
}

function DeliveryStep({
  deliveryMethod,
  setDeliveryMethod,
  address,
  updateAddress,
  findCep,
  cepLoading,
}: {
  deliveryMethod: CheckoutDeliveryMethod;
  setDeliveryMethod: (method: CheckoutDeliveryMethod) => void;
  address: CheckoutAddress;
  updateAddress: (field: keyof CheckoutAddress, value: string) => void;
  findCep: (zip: string) => void;
  cepLoading: boolean;
}) {
  return (
    <div>
      <StepHeading
        number={2}
        title="Como você quer receber?"
        description="Escolha entre entrega no endereço informado ou retirada diretamente na loja."
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ChoiceCard
          selected={deliveryMethod === "delivery"}
          title="Receber no endereço"
          description="O frete será calculado na integração seguinte."
          onClick={() => setDeliveryMethod("delivery")}
        />
        <ChoiceCard
          selected={deliveryMethod === "pickup"}
          title="Retirar na loja"
          description="Feira de Santana, Bahia. Sem custo de frete."
          onClick={() => setDeliveryMethod("pickup")}
        />
      </div>

      {deliveryMethod === "delivery" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">
              CEP
            </span>
            <div className="relative">
              <input
                value={address.zip}
                onChange={(event) => {
                  const zip = formatZip(event.target.value);
                  updateAddress("zip", zip);
                  if (onlyDigits(zip).length === 8) findCep(zip);
                }}
                onBlur={(event) => findCep(event.target.value)}
                autoComplete="postal-code"
                inputMode="numeric"
                className={inputClass}
              />
              {cepLoading ? (
                <span className="absolute right-4 top-6 text-xs font-black text-[color:var(--brand)]">
                  Buscando...
                </span>
              ) : null}
            </div>
          </label>
          <CheckoutInput
            label="Número"
            value={address.number}
            onChange={(value) => updateAddress("number", value)}
            autoComplete="address-line2"
          />
          <div className="sm:col-span-2">
            <CheckoutInput
              label="Rua ou avenida"
              value={address.street}
              onChange={(value) => updateAddress("street", value)}
              autoComplete="address-line1"
            />
          </div>
          <CheckoutInput
            label="Complemento"
            value={address.complement}
            onChange={(value) => updateAddress("complement", value)}
            placeholder="Apto, bloco, referência..."
          />
          <CheckoutInput
            label="Bairro"
            value={address.district}
            onChange={(value) => updateAddress("district", value)}
          />
          <CheckoutInput
            label="Cidade"
            value={address.city}
            onChange={(value) => updateAddress("city", value)}
            autoComplete="address-level2"
          />
          <CheckoutInput
            label="UF"
            value={address.state}
            onChange={(value) =>
              updateAddress("state", value.toUpperCase().slice(0, 2))
            }
            autoComplete="address-level1"
          />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-white/70 p-5">
          <p className="font-black">Neto Rodas</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            Feira de Santana, Bahia. A equipe confirmará o horário de retirada
            após o pagamento.
          </p>
        </div>
      )}
    </div>
  );
}

function PaymentStep({
  paymentMethod,
  setPaymentMethod,
}: {
  paymentMethod: CheckoutPaymentMethod;
  setPaymentMethod: (method: CheckoutPaymentMethod) => void;
}) {
  return (
    <div>
      <StepHeading
        number={3}
        title="Escolha como pagar"
        description="A cobrança ainda não será executada. O checkout está preparado para receber o gateway com segurança."
      />
      <div className="mt-6 space-y-3">
        <ChoiceCard
          selected={paymentMethod === "pix"}
          title="PIX"
          tag="Mais rápido"
          description="Confirmação automática assim que o gateway estiver conectado."
          onClick={() => setPaymentMethod("pix")}
        />
        <ChoiceCard
          selected={paymentMethod === "credit_card"}
          title="Cartão de crédito"
          tag="Parcelamento"
          description="Os dados do cartão serão coletados somente pelo provedor de pagamento."
          onClick={() => setPaymentMethod("credit_card")}
        />
        <ChoiceCard
          selected={paymentMethod === "store"}
          title="Combinar com a loja"
          tag="Atendimento"
          description="A equipe entra em contato para definir a forma de pagamento."
          onClick={() => setPaymentMethod("store")}
        />
      </div>
    </div>
  );
}

function ReviewStep({
  customer,
  deliveryMethod,
  addressSummary,
  paymentMethod,
  setStep,
}: {
  customer: CheckoutCustomer;
  deliveryMethod: CheckoutDeliveryMethod;
  addressSummary: string;
  paymentMethod: CheckoutPaymentMethod;
  setStep: (step: Step) => void;
}) {
  const paymentLabel =
    paymentMethod === "pix"
      ? "PIX"
      : paymentMethod === "credit_card"
        ? "Cartão de crédito"
        : "Combinar com a loja";

  return (
    <div>
      <StepHeading
        number={4}
        title="Revise antes de continuar"
        description="Confira os dados. O preço foi recalculado diretamente no ERP."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ReviewCard
          label="Cliente"
          title={`${customer.first_name} ${customer.last_name}`}
          detail={`${customer.email} · ${customer.phone}`}
          onEdit={() => setStep(1)}
        />
        <ReviewCard
          label="Entrega"
          title={
            deliveryMethod === "delivery" ? "Receber no endereço" : "Retirar na loja"
          }
          detail={
            deliveryMethod === "delivery"
              ? addressSummary
              : "Feira de Santana, Bahia"
          }
          onEdit={() => setStep(2)}
        />
        <div className="sm:col-span-2">
          <ReviewCard
            label="Pagamento escolhido"
            title={paymentLabel}
            detail="A cobrança será feita pelo gateway na próxima integração."
            onEdit={() => setStep(3)}
          />
        </div>
      </div>
    </div>
  );
}

function ReviewCard({
  label,
  title,
  detail,
  onEdit,
}: {
  label: string;
  title: string;
  detail: string;
  onEdit: () => void;
}) {
  return (
    <article className="h-full rounded-2xl bg-white/70 p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--brand)]">
        {label}
      </p>
      <p className="mt-3 font-black">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{detail}</p>
      <button
        type="button"
        onClick={onEdit}
        className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[color:var(--brand)]"
      >
        Editar
      </button>
    </article>
  );
}

function CheckoutInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "email" | "tel" | "text";
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className={inputClass}
      />
    </label>
  );
}

function OrderSummary({
  validating,
  validation,
  subtotal,
  deliveryMethod,
}: {
  validating: boolean;
  validation: CheckoutValidation | null;
  subtotal: number;
  deliveryMethod: CheckoutDeliveryMethod;
}) {
  return (
    <aside className="h-fit rounded-[2.5rem] bg-[color:var(--night)] p-5 text-white card-shadow lg:sticky lg:top-24 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-200">
          Seu pedido
        </p>
        <Link
          href="/carrinho"
          className="text-xs font-black uppercase tracking-[0.12em] text-stone-300"
        >
          Editar
        </Link>
      </div>

      {validating ? (
        <div className="mt-6 space-y-3">
          {[1, 2].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      ) : (
        <div className="mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {(validation?.items || []).map((item) => (
            <div
              key={item.product.id}
              className="grid grid-cols-[64px_1fr] gap-3 rounded-2xl bg-white/8 p-3"
            >
              <div className="relative h-16 overflow-hidden rounded-xl bg-stone-700">
                <Image
                  src={item.product.image_url}
                  alt={item.product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{item.product.name}</p>
                <p className="mt-1 text-xs text-stone-400">
                  {productMeasure(item.product)} · {item.quantity} un.
                </p>
                <p className="mt-1 text-sm font-black text-orange-200">
                  {formatMoney(item.line_total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {validation && !validation.ok ? (
        <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/15 p-4">
          <p className="text-sm font-black">O carrinho precisa de atenção</p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-red-100">
            {validation.issues.map((issue) => (
              <li key={issue}>• {issue}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 space-y-3 border-t border-white/15 pt-5 text-sm">
        <div className="flex justify-between text-stone-300">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        <div className="flex justify-between text-stone-300">
          <span>Frete</span>
          <span>{deliveryMethod === "pickup" ? "Grátis" : "A calcular"}</span>
        </div>
        <div className="flex items-end justify-between border-t border-white/15 pt-4">
          <span className="font-black">Total parcial</span>
          <strong className="display-font text-3xl">{formatMoney(subtotal)}</strong>
        </div>
      </div>
      <p className="mt-5 text-xs leading-5 text-stone-400">
        Nenhuma cobrança ou baixa de estoque acontece nesta etapa.
      </p>
    </aside>
  );
}
