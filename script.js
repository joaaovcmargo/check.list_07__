(function() {
    'use strict';

    // === ELEMENTOS DOM ===
    const taskList = document.getElementById('taskList');
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const clearDoneBtn = document.getElementById('clearDoneBtn');
    const doneCount = document.getElementById('doneCount');
    const totalCount = document.getElementById('totalCount');

    // === ESTADO ===
    let tasks = [];

    // === ROTINAS PRÉ-DEFINIDAS ===
    const ROUTINES = {
        morning: [
            'Acordar sem enrolar',
            'Beber um copo de água',
            'Meditar / Respirar 5 min',
            'Fazer alongamento',
            'Tomar café da manhã saudável',
            'Planejar o dia (3 metas)'
        ],
        work: [
            'Revisar e-mails pendentes',
            'Definir prioridades do dia',
            'Executar tarefa mais importante (2h)',
            'Pausa de 5 min a cada 50 min',
            'Reunião / alinhamento com equipe',
            'Revisar progresso e ajustar'
        ],
        evening: [
            'Desconectar das telas 1h antes',
            'Preparar roupa e mochila para amanhã',
            'Jantar leve e sem pressa',
            'Leitura de 20 minutos',
            'Escrever 3 coisas boas do dia',
            'Dormir até 23h'
        ],
        health: [
            'Beber 8 copos de água',
            'Fazer 30 min de exercício',
            'Comer uma fruta ou salada',
            'Dormir 7-8 horas',
            'Evitar açúcar e ultraprocessados',
            'Fazer check-up postural'
        ]
    };

    // === FUNÇÕES DE PERSISTÊNCIA ===
    function loadTasks() {
        try {
            const stored = localStorage.getItem('notebook_tasks');
            if (stored) {
                tasks = JSON.parse(stored);
                tasks = tasks.map(t => ({
                    text: t.text || 'Tarefa',
                    done: typeof t.done === 'boolean' ? t.done : false
                }));
            } else {
                tasks = [
                    { text: 'Definir meta principal do dia', done: false },
                    { text: 'Revisar checklist noturno', done: false },
                    { text: 'Beber água regularmente', done: false }
                ];
            }
        } catch (e) {
            tasks = [];
        }
        render();
    }

    function saveTasks() {
        localStorage.setItem('notebook_tasks', JSON.stringify(tasks));
    }

    // === RENDER ===
    function render() {
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            taskList.innerHTML = `
                <li class="empty-message">
                    <span class="emoji-big">📝</span>
                    Nenhuma tarefa ainda.<br />Adicione uma acima ou carregue uma rotina!
                </li>
            `;
            updateCounts();
            return;
        }

        const sorted = [...tasks];
        sorted.sort((a, b) => {
            if (a.done === b.done) return 0;
            return a.done ? 1 : -1;
        });

        for (const task of sorted) {
            const li = document.createElement('li');
            li.className = 'task-item' + (task.done ? ' done' : '');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'check';
            checkbox.checked = task.done;
            checkbox.addEventListener('change', function(e) {
                const idx = tasks.indexOf(task);
                if (idx !== -1) {
                    tasks[idx].done = this.checked;
                    saveTasks();
                    render();
                }
            });

            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.textContent = '✕';
            delBtn.setAttribute('aria-label', 'Remover tarefa');
            delBtn.addEventListener('click', function() {
                const idx = tasks.indexOf(task);
                if (idx !== -1) {
                    tasks.splice(idx, 1);
                    saveTasks();
                    render();
                }
            });

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(delBtn);
            taskList.appendChild(li);
        }

        updateCounts();
    }

    function updateCounts() {
        const total = tasks.length;
        const done = tasks.filter(t => t.done).length;
        doneCount.textContent = done;
        totalCount.textContent = total;
    }

    // === ADICIONAR TAREFA ===
    function addTask(text) {
        const trimmed = text.trim();
        if (!trimmed) return false;
        tasks.push({ text: trimmed, done: false });
        saveTasks();
        render();
        return true;
    }

    // === LIMPAR CONCLUÍDAS ===
    function clearDone() {
        const newTasks = tasks.filter(t => !t.done);
        if (newTasks.length === tasks.length) {
            alert('Nenhuma tarefa concluída para remover.');
            return;
        }
        tasks = newTasks;
        saveTasks();
        render();
    }

    // === LIMPAR TUDO ===
    function clearAll() {
        if (tasks.length === 0) return;
        if (confirm('Tem certeza que deseja apagar TODAS as tarefas?')) {
            tasks = [];
            saveTasks();
            render();
        }
    }

    // === CARREGAR ROTINA ===
    function loadRoutine(routineKey) {
        const items = ROUTINES[routineKey];
        if (!items) return;
        const existingTexts = new Set(tasks.map(t => t.text.trim().toLowerCase()));
        let added = 0;
        for (const item of items) {
            const key = item.trim().toLowerCase();
            if (!existingTexts.has(key)) {
                tasks.push({ text: item.trim(), done: false });
                existingTexts.add(key);
                added++;
            }
        }
        if (added === 0) {
            alert('Essas tarefas já estão na sua lista!');
        } else {
            saveTasks();
            render();
        }
    }

    // === EVENTOS ===
    addBtn.addEventListener('click', function() {
        const text = taskInput.value;
        if (addTask(text)) {
            taskInput.value = '';
            taskInput.focus();
        } else {
            taskInput.focus();
            taskInput.style.borderColor = '#dbb8a8';
            setTimeout(() => {
                taskInput.style.borderColor = '';
            }, 600);
        }
    });

    taskInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addBtn.click();
        }
    });

    clearDoneBtn.addEventListener('click', clearDone);
    clearAllBtn.addEventListener('click', clearAll);

    document.querySelectorAll('[data-routine]').forEach(btn => {
        btn.addEventListener('click', function() {
            const key = this.dataset.routine;
            loadRoutine(key);
        });
    });

    // === INICIALIZAÇÃO ===
    loadTasks();
    taskInput.focus();

    window.addEventListener('beforeunload', function() {
        saveTasks();
    });
})();