import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import { db, type Task } from "./db";
import { TaskEditInput, TaskItem, TaskList } from "./components";

const taskBodySchema = t.Object({
  text: t.String({
    minLength: 1,
    error: "La tarea no puede estar vacía."
  }),
});

const app = new Elysia()
  .use(html())
  .decorate("db", db)
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 422;
      set.headers['HX-Reswap'] = 'innerHTML';
      set.headers['HX-Retarget'] = '#form-error';
      return `<p style="color: red;">${error.message}</p>`;
    }
  })
  .get("/", () => Bun.file("index.html"))
  .get("/tasks", ({ db }) => {
    const tasks = db.query("SELECT * FROM tasks ORDER BY id DESC").all() as Task[];
    return TaskList({ tasks });
  })
  .post("/tasks",
    async ({ db, body, set }) => {
      const { text } = body;
      const newTask = db
        .query("INSERT INTO tasks (text) VALUES ($text) RETURNING *")
        .get({ $text: text }) as Task;
      set.headers['HX-Trigger'] = 'clear-error';
      return TaskItem(newTask);
    },
    { body: taskBodySchema }
  )
  .get("/tasks/:id", ({ db, params }) => {
    const id = Number(params.id);
    if (isNaN(id)) return new Response("ID inválido", { status: 400 });
    const task = db.query("SELECT * FROM tasks WHERE id = $id")
      .get({ $id: id }) as Task | undefined;
    if (!task) return new Response("Tarea no encontrada", { status: 404 });
    return TaskItem(task);
  })
  .get("/tasks/edit/form/:id", ({ db, params }) => {
    const id = Number(params.id);
    if (isNaN(id)) return new Response("ID inválido", { status: 400 });
    const task = db.query("SELECT * FROM tasks WHERE id = $id")
      .get({ $id: id }) as Task | undefined;
    if (!task) return new Response("Tarea no encontrada", { status: 404 });
    return TaskEditInput(task);
  })
  .put("/tasks/:id/update", 
    ({ db, params, body }) => {
      const id = Number(params.id);
      if (isNaN(id)) return new Response("ID inválido", { status: 400 });
      const { text } = body;
      db.query("UPDATE tasks SET text = $text WHERE id = $id RETURNING *")
        .get({ $text: text, $id: id }) as Task;
      const tasks = db.query("SELECT * FROM tasks ORDER BY id DESC").all() as Task[];
      return TaskList({ tasks });
    },
    { body: taskBodySchema }
  )
  .delete("/tasks/:id", ({ db, params }) => {
    const id = Number(params.id);
    if (isNaN(id)) return new Response("ID inválido", { status: 400 });
    db.query("DELETE FROM tasks WHERE id = $id").run({ $id: id });
    return "";
  })
  .put("/tasks/:id/toggle", ({ db, params }) => {
    const id = Number(params.id);
    if (isNaN(id)) return new Response("ID inválido", { status: 400 });
    const currentTask = db.query("SELECT * FROM tasks WHERE id = $id")
      .get({ $id: id }) as Task | undefined;
    if (!currentTask) return new Response("Tarea no encontrada", { status: 404 });
    const newCompleted = !currentTask.completed;
    db.query("UPDATE tasks SET completed = $completed WHERE id = $id")
      .run({ $completed: newCompleted ? 1 : 0, $id: id });
    return TaskItem({
      id,
      text: currentTask.text,
      completed: newCompleted,
    });
  })
  .listen(3000);

console.log(
  `🦊 Servidor Elysia corriendo en http://${app.server?.hostname}:${app.server?.port}`
);
