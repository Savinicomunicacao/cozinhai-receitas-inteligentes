import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/AppLogo";
import { useNavigate } from "react-router-dom";
import { 
  MessageSquare, 
  Camera, 
  ChefHat, 
  Sparkles, 
  Leaf, 
  PiggyBank, 
  Heart,
  Check,
  ChevronDown
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Landing() {
  const navigate = useNavigate();

  const handleCTA = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <AppLogo size="sm" />
          <Button onClick={handleCTA} size="sm" className="rounded-full">
            Começar grátis
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        <div className="container mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24 relative">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight mb-6">
              Chega de abrir a geladeira e não saber o que fazer.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              O Cozinha.ai decide com você. Simples assim.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button 
                onClick={handleCTA} 
                size="lg" 
                className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Experimentar grátis por 7 dias
              </Button>
              <p className="text-sm text-muted-foreground">
                Sem cartão. Cancele quando quiser.
              </p>
            </div>
          </div>

          {/* App Mockup */}
          <div className="mt-12 max-w-sm mx-auto">
            <div className="bg-card rounded-3xl shadow-card p-4 border border-border">
              <div className="bg-muted/30 rounded-2xl p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 bg-background rounded-2xl rounded-tl-sm p-3">
                    <p className="text-sm text-foreground">Tenho frango, tomate e queijo. O que posso fazer?</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="flex-1 bg-primary/10 rounded-2xl rounded-tr-sm p-3">
                    <p className="text-sm text-foreground font-medium">Frango Gratinado com Tomate</p>
                    <p className="text-xs text-muted-foreground mt-1">25 min · Fácil · 4 porções</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                    <ChefHat className="w-4 h-4 text-success" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN SECTION */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-12">
              Você conhece essa sensação?
            </h2>
            
            <div className="space-y-6">
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
                <p className="text-foreground">
                  Você chega cansada. Abre a geladeira. Tem coisa, mas nada vira receita na sua cabeça.
                </p>
              </div>
              
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
                <p className="text-foreground">
                  Compra ingredientes com boas intenções. Eles estragam antes de virar algo.
                </p>
              </div>
              
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
                <p className="text-foreground">
                  Pergunta todo dia: "o que fazer de janta?"
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg md:text-xl text-foreground font-medium">
                O problema não é falta de comida.
              </p>
              <p className="text-lg md:text-xl text-accent-foreground font-bold mt-2">
                É ter que decidir o tempo todo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">A solução</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8">
              O Cozinha.ai olha pra sua geladeira junto com você.
            </h2>
            
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>Você conta o que tem. Ele mostra o que dá pra fazer.</p>
              <p className="text-foreground font-medium">Simples. Rápido. Sem julgamento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-12">
              Como funciona
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 text-primary" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                  1
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Conta o que você tem
                </h3>
                <p className="text-muted-foreground text-sm">
                  Fale, digite ou tire uma foto dos ingredientes
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-7 h-7 text-success" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                  2
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Receba sugestões
                </h3>
                <p className="text-muted-foreground text-sm">
                  Receitas possíveis, com o que você já tem em casa
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-7 h-7 text-warning" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                  3
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Cozinhe com calma
                </h3>
                <p className="text-muted-foreground text-sm">
                  Passo a passo simples, sem complicação
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATORS */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-12">
              Por que o Cozinha.ai é diferente
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Praticidade real
                </h3>
                <p className="text-muted-foreground text-sm">
                  Receitas que cabem na sua rotina, não no Instagram.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Menos desperdício
                </h3>
                <p className="text-muted-foreground text-sm">
                  Use o que já está aí, antes que estrague.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                  <PiggyBank className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Economia de verdade
                </h3>
                <p className="text-muted-foreground text-sm">
                  Pare de comprar o que não precisa.
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  Menos estresse
                </h3>
                <p className="text-muted-foreground text-sm">
                  Deixa a decisão com a gente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-primary/10">
                <p className="text-foreground font-medium text-lg italic">
                  "Feito pra vida real. Não pra Instagram."
                </p>
              </div>
              
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-primary/10">
                <p className="text-foreground font-medium text-lg italic">
                  "Pra quem decide o jantar todo santo dia."
                </p>
              </div>
              
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-primary/10">
                <p className="text-foreground font-medium text-lg italic">
                  "Sem receita gourmet. Sem frescura."
                </p>
              </div>
              
              <div className="bg-background rounded-2xl p-6 shadow-sm border border-primary/10">
                <p className="text-foreground font-medium text-lg italic">
                  "Prático como deveria ser."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-4">
              Escolha seu plano
            </h2>
            <p className="text-muted-foreground text-center mb-12">
              Comece com 7 dias grátis. Cancele quando quiser.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                  Gratuito
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Para experimentar
                </p>
                <p className="text-3xl font-bold text-foreground mb-6">
                  R$ 0
                  <span className="text-base font-normal text-muted-foreground">/mês</span>
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    3 receitas por semana
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    Funções básicas
                  </li>
                </ul>
                
                <Button 
                  variant="outline" 
                  className="w-full rounded-full"
                  onClick={handleCTA}
                >
                  Começar grátis
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="bg-primary/5 rounded-2xl p-6 shadow-lg border-2 border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Mais popular
                  </span>
                </div>
                
                <h3 className="font-display font-semibold text-foreground text-lg mb-2">
                  Pro
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Para o dia a dia
                </p>
                <p className="text-3xl font-bold text-foreground mb-6">
                  R$ 14,99
                  <span className="text-base font-normal text-muted-foreground">/mês</span>
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Sugestões ilimitadas
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Escanear receitas de livros
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Lista de compras automática
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Pastas de organização
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Favoritos ilimitados
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Sem anúncios
                  </li>
                </ul>
                
                <Button 
                  className="w-full rounded-full"
                  onClick={handleCTA}
                >
                  Começar 7 dias grátis
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Sem cartão necessário
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-12">
              Perguntas frequentes
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="bg-background rounded-xl border border-border/50 px-6">
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  Preciso saber cozinhar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Não. As receitas são simples e explicadas passo a passo. Se você sabe ligar o fogão, consegue fazer.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-background rounded-xl border border-border/50 px-6">
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  Preciso cadastrar tudo que tenho em casa?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Não. Você conta só o que quer usar agora. Sem inventário, sem complicação.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-background rounded-xl border border-border/50 px-6">
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  É só pra dieta?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Não. É pra qualquer refeição, do jeito que você quiser. Comida de verdade, sem frescura.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-background rounded-xl border border-border/50 px-6">
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  Vale a pena pagar?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Se você cozinha em casa, o tempo e dinheiro que economiza já pagam o app. E você ainda pode testar grátis por 7 dias.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 md:py-24 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
              Sua próxima refeição pode ser mais leve. De verdade.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Deixe o Cozinha.ai te ajudar a decidir.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button 
                onClick={handleCTA} 
                size="lg" 
                className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Começar agora - 7 dias grátis
              </Button>
              <p className="text-sm text-muted-foreground">
                Sem cartão. Sem compromisso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <AppLogo size="sm" className="mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Feito com cuidado para facilitar sua rotina.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
              <a href="#" className="hover:text-foreground transition-colors">
                Termos de Uso
              </a>
              <span className="text-border">|</span>
              <a href="#" className="hover:text-foreground transition-colors">
                Política de Privacidade
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2025 Cozinha.ai. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Sticky CTA for mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border md:hidden safe-area-bottom">
        <Button 
          onClick={handleCTA} 
          className="w-full rounded-full py-6"
        >
          Experimentar grátis por 7 dias
        </Button>
      </div>
    </div>
  );
}
