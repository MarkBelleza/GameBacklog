// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import GameViewToggle from "../GameViewToggle";

describe("GameViewToggle", () => {
    afterEach(() => {
        cleanup();
    });

    it("marks the selected view and notifies when switching views", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<GameViewToggle view="card" onChange={onChange} />);

        expect(screen.getByRole("button", { name: "Card view" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: "List view" })).toHaveAttribute("aria-pressed", "false");

        await user.click(screen.getByRole("button", { name: "List view" }));

        expect(onChange).toHaveBeenCalledWith("list");
    });
});
