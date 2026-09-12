import { describe, expect, it } from "vitest";
import { deriveTaskNotifications } from "./notifications";
import type { Task } from "./types";

const TODAY = "2026-09-15";
const NOW_MS = new Date("2026-09-15T18:00:00.000Z").getTime();

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: `t-${Math.random()}`,
    title: "Tarefa",
    status: "a_fazer",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("deriveTaskNotifications", () => {
  it("gera notificação para tarefa atrasada", () => {
    const tasks = [makeTask({ title: "Pagar aluguel", dueDate: "2026-09-10" })];
    const notifications = deriveTaskNotifications(tasks, TODAY, NOW_MS);
    expect(notifications).toHaveLength(1);
    expect(notifications[0].title).toBe("Tarefa atrasada");
    expect(notifications[0].description).toBe("Pagar aluguel");
  });

  it("gera notificação para tarefa que vence hoje", () => {
    const tasks = [makeTask({ title: "Responder DMs", dueDate: TODAY })];
    const notifications = deriveTaskNotifications(tasks, TODAY, NOW_MS);
    expect(notifications[0].title).toBe("Tarefa vence hoje");
  });

  it("gera notificação para tarefa concluída recentemente (últimas 24h)", () => {
    const tasks = [makeTask({ title: "Trocar foto", status: "concluido", completedAt: "2026-09-15T10:00:00.000Z" })];
    const notifications = deriveTaskNotifications(tasks, TODAY, NOW_MS);
    expect(notifications[0].title).toBe("Tarefa concluída");
  });

  it("não notifica conclusão antiga (fora da janela de 24h)", () => {
    const tasks = [makeTask({ status: "concluido", completedAt: "2026-09-01T10:00:00.000Z" })];
    expect(deriveTaskNotifications(tasks, TODAY, NOW_MS)).toHaveLength(0);
  });

  it("não notifica tarefa vencendo hoje se já está concluída", () => {
    const tasks = [makeTask({ dueDate: TODAY, status: "concluido" })];
    const notifications = deriveTaskNotifications(tasks, TODAY, NOW_MS);
    expect(notifications.find((n) => n.title === "Tarefa vence hoje")).toBeUndefined();
  });
});
