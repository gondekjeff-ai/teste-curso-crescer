import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CookieConsentBanner from "@/components/CookieConsentBanner";

const renderBanner = () =>
  render(
    <MemoryRouter>
      <CookieConsentBanner />
    </MemoryRouter>
  );

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("CookieConsentBanner - semantics", () => {
  it("renders the initial banner as a dialog with title/description bound via aria", () => {
    renderBanner();
    const dialog = screen.getByTestId("cookie-banner");
    expect(dialog).toHaveAttribute("role", "dialog");
    const labelId = dialog.getAttribute("aria-labelledby");
    const descId = dialog.getAttribute("aria-describedby");
    expect(labelId).toBeTruthy();
    expect(descId).toBeTruthy();
    expect(document.getElementById(labelId!)).toHaveTextContent(/cookies/i);
    expect(document.getElementById(descId!)).toHaveTextContent(/LGPD/i);
  });

  it("opens preferences modal with role=dialog, aria-modal and bound title/description", async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByRole("button", { name: /configurar/i }));

    const modal = await screen.findByTestId("cookie-preferences-modal");
    expect(modal).toHaveAttribute("role", "dialog");
    expect(modal).toHaveAttribute("aria-modal", "true");
    const labelId = modal.getAttribute("aria-labelledby");
    const descId = modal.getAttribute("aria-describedby");
    expect(document.getElementById(labelId!)).toHaveTextContent(/preferências de cookies/i);
    expect(document.getElementById(descId!)).toHaveTextContent(/categorias de cookies/i);
  });
});

describe("CookieConsentBanner - keyboard accessibility", () => {
  it("closes the modal when pressing Escape", async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByRole("button", { name: /configurar/i }));
    expect(await screen.findByTestId("cookie-preferences-modal")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("cookie-preferences-modal")).not.toBeInTheDocument();
  });

  it("focuses the close button when the modal opens", async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByRole("button", { name: /configurar/i }));
    const modal = await screen.findByTestId("cookie-preferences-modal");
    const closeBtn = within(modal).getByRole("button", {
      name: /fechar preferências de cookies/i,
    });
    await vi.waitFor(() => expect(closeBtn).toHaveFocus());
  });

  it("traps Tab focus inside the modal (Shift+Tab from first goes to last)", async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByRole("button", { name: /configurar/i }));
    const modal = await screen.findByTestId("cookie-preferences-modal");

    const focusables = modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    expect(focusables.length).toBeGreaterThan(1);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first.focus();
    await vi.waitFor(() => expect(first).toHaveFocus());
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
  });

  it("allows fully reaching action buttons via Tab cycling", async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByRole("button", { name: /configurar/i }));
    const modal = await screen.findByTestId("cookie-preferences-modal");

    expect(within(modal).getByRole("button", { name: /aceitar todos/i })).toBeInTheDocument();
    expect(within(modal).getByRole("button", { name: /salvar preferências/i })).toBeInTheDocument();
    expect(within(modal).getByRole("button", { name: /recusar não essenciais/i })).toBeInTheDocument();
  });
});

describe("CookieConsentBanner - persistence & screen reader announcements", () => {
  it("stores consent in localStorage with version + timestamp when accepting all", async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByRole("button", { name: /aceitar todos/i }));

    const raw = localStorage.getItem("optistrat-cookie-consent");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.method).toBe("accept_all");
    expect(parsed.categories).toEqual({ necessary: true, analytics: true, marketing: true });
    expect(typeof parsed.timestamp).toBe("string");
    expect(typeof parsed.version).toBe("string");
  });

  it("exposes switches with aria-labelledby / aria-describedby for screen readers", async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(screen.getByRole("button", { name: /configurar/i }));
    const modal = await screen.findByTestId("cookie-preferences-modal");
    const switches = within(modal).getAllByRole("switch");
    expect(switches.length).toBe(3);
    switches.forEach((s) => {
      const labelId = s.getAttribute("aria-labelledby");
      const descId = s.getAttribute("aria-describedby");
      expect(labelId && document.getElementById(labelId)).toBeTruthy();
      expect(descId && document.getElementById(descId)).toBeTruthy();
    });
  });
});