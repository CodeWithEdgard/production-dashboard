
import React from "react";

export function Footer() {

  const currentYear = new Date().getFullYear

  return (
    <footer className="bg-muted border-t">
      <div className="container mx-auto py-4 text-center text-sm text-muted-foreground">
        <p>© {currentYear} Elak Labs. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}