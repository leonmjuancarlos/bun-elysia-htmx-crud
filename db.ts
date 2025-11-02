import { Database } from "bun:sqlite";

// Definimos la estructura de nuestras tareas
export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

// Inicializamos una nueva base de datos en un archivo
export const db = new Database("db.sqlite", { create: true });

// Creamos la tabla 'tasks' si no existe
// 'completed' será 0 (false) o 1 (true)
db.query(
  `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  );
`
).run();
