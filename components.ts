import type { Task } from "./db";

export const TaskItem = ({ id, text, completed }: Task): string => {
  return `
    <li class="${completed ? "completed" : ""}">
      <input 
        type="checkbox" 
        id="task-${id}"
        ${completed ? "checked" : ""}
        hx-put="/tasks/${id}/toggle"
        hx-target="closest li"
        hx-swap="outerHTML"
      >

      <label 
        style="${completed ? "text-decoration: line-through" : ""}; cursor: pointer;"
      >
        ${text}
      </label>
      ${ !completed ? `
        <button 
          hx-get="/tasks/edit/form/${id}"
          hx-target="#modal-container"
          hx-swap="innerHTML"
          class="delete-btn"
          style="margin-left: 5px;"
        >
          Editar
        </button>`
        :
        ""
      }
      
      <button 
        hx-delete="/tasks/${id}"
        hx-target="closest li"
        hx-swap="outerHTML"
        hx-confirm="¿Seguro que quieres borrar esta tarea?"
        class="delete-btn"
        style="margin-left: 5px;"
      >
        Borrar
      </button>
    </li>
  `;
};

export const TaskEditInput = ({ id, text }: Task): string => {
  return `
  <div 
    id="modal"
    style="
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    "
    hx-target="this"
    hx-swap="outerHTML"
  >
    <div 
      style="
        background: var(--bg);
        padding: 2rem;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
      "
    >
      <h3>Editar tarea</h3>
      <form
        hx-put="/tasks/${id}/update"
        hx-target="#task-list"
        hx-swap="innerHTML"
        hx-on::after-request="document.getElementById('modal').remove()"
      >
        <input 
          type="text" 
          name="text" 
          value="${text}"
          autofocus
          style="width: 100%; margin-bottom: 1rem;"
          required
        />
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button type="submit">Guardar</button>
          <button 
            type="button"
            hx-get="/tasks"
            hx-target="#task-list"
            hx-swap="innerHTML"
            hx-on:click="document.getElementById('modal').remove()"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
  `;
};


export const TaskList = ({ tasks }: { tasks: Task[] }): string => {
  return tasks
    .map((task) => TaskItem(task)).join("");
};