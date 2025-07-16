
import React from "react";

export function Header () {
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

      <a href="/" className="text-lg font-bold">
        Elak Labs
      </a>

      {/* Links de Navegação */}
      <div className="flex items-center space-x-6">
        <a href="/recebimento" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Recebimento</a>

        <a href="/separacao" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Separação</a>

        <a href="/requisicao" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Requisição</a>

        <a href="/alteracao" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Alteração</a>

        <a href="/relatoriornc" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        RNC</a>
      </div>

      </div>

    </header>
  )
}