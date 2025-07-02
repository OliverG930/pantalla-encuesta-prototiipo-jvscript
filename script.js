// script.js

document.addEventListener('DOMContentLoaded', () => {
    const surveyListSection = document.getElementById('survey-list-section');
    const surveyFormSection = document.getElementById('survey-form-section');
    const newSurveyBtn = document.getElementById('new-survey-btn');
    const backBtnList = document.getElementById('back-btn-list');
    const surveyTableBody = document.getElementById('survey-table-body');
    const rowsPerPageSelect = document.getElementById('rows-per-page-select');
    const paginationNumbers = document.getElementById('pagination-numbers');
    const individualSurveyForm = document.getElementById('individual-survey-form');
    const surveyQuestionsContainer = document.getElementById('survey-questions-container');
    const formTitle = document.getElementById('form-title');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const submitSurveyBtn = document.getElementById('submit-survey-btn');

    let currentSurveyId = null; // Para almacenar el ID de la encuesta que se está visualizando/respondiendo
    let currentPage = 1;
    let rowsPerPage = parseInt(rowsPerPageSelect.value);

    // --- Datos Simulados (en un entorno real, vendrían de una API/DB) ---

    // Simulación de las encuestas disponibles (primera imagen)
    const surveys = [
        {
            id: 1,
            formulario: 'formulario1',
            clase_encuesta: 'Tipo 1',
            fecha_desde: '17-04-2025',
            fecha_hasta: '17-04-2026',
            observacion: 'periodo de encuesta 30'
        },
        {
            id: 2,
            formulario: 'formulario2',
            clase_encuesta: 'Tipo 2',
            fecha_desde: '31-05-2025',
            fecha_hasta: '31-05-2026',
            observacion: 'periodo de encuesta 40'
        },
        {
            id: 3,
            formulario: 'formulario3',
            clase_encuesta: 'Tipo 1',
            fecha_desde: '01-06-2025',
            fecha_hasta: '01-06-2026',
            observacion: 'Encuesta anual de clima'
        },
        {
            id: 4,
            formulario: 'formulario4',
            clase_encuesta: 'Tipo 3',
            fecha_desde: '10-07-2025',
            fecha_hasta: '10-07-2026',
            observacion: 'Encuesta de desempeño'
        },
        {
            id: 5,
            formulario: 'formulario5',
            clase_encuesta: 'Tipo 2',
            fecha_desde: '20-08-2025',
            fecha_hasta: '20-08-2026',
            observacion: 'Satisfacción laboral'
        }
    ];

    // Simulación de las preguntas para un formulario de encuesta (segunda imagen)
    // En un sistema real, estas preguntas se cargarían dinámicamente según el 'formulario' seleccionado.
    // Aquí, para simplificar, asumiremos un conjunto de preguntas que se aplicaría al cargar un formulario.
    const surveyQuestions = [
        {
            id: 1,
            orden: 1,
            pregunta: '¿CÓMO CALIFICAS LA LIMPIEZA DE TU OFICINA?',
            tipo: 'radio_scale', // Escala del 1 al 5
            obligatoria: true,
            opciones: [
                { id: 1, valor: 1 },
                { id: 2, valor: 2 },
                { id: 3, valor: 3 },
                { id: 4, valor: 4 },
                { id: 5, valor: 5 }
            ]
        },
        {
            id: 2,
            orden: 2,
            pregunta: '¿CÓMO EVALUAS LA SUFICIENCIA DE LAS HERRAMIENTAS PROVEIDAS EN LA OFICINA?',
            tipo: 'radio_text', // Opciones de texto
            obligatoria: true,
            opciones: [
                { id: 6, valor: 'Muy bajo' },
                { id: 7, valor: 'Bajo' },
                { id: 8, valor: 'Medio' },
                { id: 9, valor: 'Alto' },
                { id: 10, valor: 'Muy alto' }
            ]
        },
        {
            id: 3,
            orden: 3,
            pregunta: 'Sugerencias adicionales sobre el desempeño del empleado.',
            tipo: 'textarea', // Campo de texto libre
            obligatoria: false,
            opciones: [] // No aplica
        }
    ];

    // Simulación de la tabla ENCUESTAS_FUNCIONARIOS (para seguimiento de encuestas asignadas)
    // En un escenario real, esto se usaría para saber qué encuestas debe responder un funcionario.
    // Aquí, lo usaremos como un registro de la "asignación" de la encuesta a un funcionario ficticio.
    const encuestasFuncionarios = []; // Almacenará { ID, ID_ENCUESTA_PERIODO, LEG_ID, ID_ESTADO, COMENTARIO }

    // Simulación de la tabla ENCUESTAS_RESPUESTAS (tercera imagen)
    const encuestasRespuestas = []; // Almacenará { ID, ID_ENCUESTA_FUNCIONARIO, ORDEN, ID_PREGUNTA, ID_PREGUNTA_ITEM, COMENTARIO }
    let nextEncuestaFuncionarioId = 1;
    let nextEncuestaRespuestaId = 1;

    // --- Funciones de Renderizado y Lógica ---

    function renderSurveyList(page = 1) {
        currentPage = page;
        surveyTableBody.innerHTML = '';
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedSurveys = surveys.slice(start, end);

        if (paginatedSurveys.length === 0) {
            surveyTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No hay encuestas disponibles.</td></tr>`;
            return;
        }

        paginatedSurveys.forEach(survey => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${survey.id}</td>
                <td>${survey.formulario}</td>
                <td>${survey.clase_encuesta}</td>
                <td>${survey.fecha_desde}</td>
                <td>${survey.fecha_hasta}</td>
                <td>${survey.observacion}</td>
                <td>
                    <div class="action-buttons">
                        <button class="view-icon" data-id="${survey.id}" title="Ver"></button>
                        <button class="edit-icon" data-id="${survey.id}" title="Editar"></button>
                        <button class="delete-icon" data-id="${survey.id}" title="Eliminar"></button>
                        <button class="upload-icon" data-id="${survey.id}" title="Subir"></button>
                    </div>
                </td>
            `;
            surveyTableBody.appendChild(row);
        });

        // Adjuntar event listeners a los botones de acción
        document.querySelectorAll('.view-icon').forEach(button => {
            button.addEventListener('click', (e) => loadSurveyForm(e.target.dataset.id));
        });
        // Implementar lógica para editar, eliminar, subir si es necesario
        // ...
        renderPagination();
    }

    function renderPagination() {
        paginationNumbers.innerHTML = '';
        const totalPages = Math.ceil(surveys.length / rowsPerPage);

        // Flecha izquierda
        const prevArrow = document.createElement('span');
        prevArrow.innerHTML = '&laquo;';
        prevArrow.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
        if (currentPage > 1) {
            prevArrow.addEventListener('click', () => renderSurveyList(currentPage - 1));
        }
        paginationNumbers.appendChild(prevArrow);

        for (let i = 1; i <= totalPages; i++) {
            const pageSpan = document.createElement('span');
            pageSpan.textContent = i;
            if (i === currentPage) {
                pageSpan.classList.add('active');
            }
            pageSpan.addEventListener('click', () => renderSurveyList(i));
            paginationNumbers.appendChild(pageSpan);
        }

        // Flecha derecha
        const nextArrow = document.createElement('span');
        nextArrow.innerHTML = '&raquo;';
        nextArrow.style.cursor = currentPage === totalPages ? 'not-allowed' : 'pointer';
        if (currentPage < totalPages) {
            nextArrow.addEventListener('click', () => renderSurveyList(currentPage + 1));
        }
        paginationNumbers.appendChild(nextArrow);
    }

    function loadSurveyForm(surveyId) {
        const selectedSurvey = surveys.find(s => s.id == surveyId);
        if (!selectedSurvey) {
            alert('Encuesta no encontrada.');
            return;
        }

        currentSurveyId = surveyId;
        formTitle.textContent = selectedSurvey.formulario; // O el nombre real del formulario de la encuesta
        surveyQuestionsContainer.innerHTML = ''; // Limpiar preguntas anteriores

        surveyQuestions.forEach(question => {
            const questionGroup = document.createElement('div');
            questionGroup.classList.add('question-group');

            const questionLabel = document.createElement('label');
            questionLabel.textContent = `${question.orden} - ${question.pregunta}`;
            if (question.obligatoria) {
                questionLabel.classList.add('required');
            }
            questionGroup.appendChild(questionLabel);

            if (question.tipo === 'radio_scale' || question.tipo === 'radio_text') {
                const optionsGroup = document.createElement('div');
                optionsGroup.classList.add('options-group');
                if (question.tipo === 'radio_text') {
                    optionsGroup.classList.add('vertical'); // Para las opciones de texto, que vayan una debajo de otra
                }

                question.opciones.forEach(option => {
                    const optionItem = document.createElement('div');
                    optionItem.classList.add('option-item');

                    const radioInput = document.createElement('input');
                    radioInput.type = 'radio';
                    radioInput.name = `question_${question.id}`;
                    radioInput.value = option.id; // Guardamos el ID del item de la pregunta
                    radioInput.dataset.questionId = question.id; // Para referencia
                    radioInput.dataset.itemValue = option.valor; // Para referencia de valor

                    const spanLabel = document.createElement('span');
                    spanLabel.textContent = option.valor;

                    optionItem.appendChild(radioInput);
                    optionItem.appendChild(spanLabel);

                    optionsGroup.appendChild(optionItem);
                });
                questionGroup.appendChild(optionsGroup);
            } else if (question.tipo === 'textarea') {
                const textarea = document.createElement('textarea');
                textarea.name = `question_${question.id}`;
                textarea.placeholder = 'Tu respuesta';
                textarea.dataset.questionId = question.id;
                questionGroup.appendChild(textarea);
            }
            surveyQuestionsContainer.appendChild(questionGroup);
        });

        surveyListSection.classList.add('hidden');
        surveyFormSection.classList.remove('hidden');
    }

    function showSurveyList() {
        surveyFormSection.classList.add('hidden');
        surveyListSection.classList.remove('hidden');
        currentSurveyId = null; // Reiniciar el ID de la encuesta actual
        // Opcional: limpiar el formulario si se desea, aunque al ocultar no es estrictamente necesario
        // individualSurveyForm.reset();
    }

    function validateForm() {
        let isValid = true;
        surveyQuestions.forEach(question => {
            if (question.obligatoria) {
                if (question.tipo === 'radio_scale' || question.tipo === 'radio_text') {
                    const selectedOption = document.querySelector(`input[name="question_${question.id}"]:checked`);
                    if (!selectedOption) {
                        isValid = false;
                        alert(`Por favor, responde la pregunta: "${question.pregunta}"`);
                        // Puedes añadir aquí un indicador visual de error
                        return; // Salir del forEach para no mostrar múltiples alertas
                    }
                } else if (question.tipo === 'textarea') {
                    const textarea = document.querySelector(`textarea[name="question_${question.id}"]`);
                    if (textarea && textarea.value.trim() === '') {
                        isValid = false;
                        alert(`Por favor, responde la pregunta: "${question.pregunta}"`);
                        // Puedes añadir aquí un indicador visual de error
                        return;
                    }
                }
            }
        });
        return isValid;
    }

    function submitSurvey(isDraft = false) {
        if (!isDraft && !validateForm()) {
            return; // No enviar si la validación falla y no es un borrador
        }

        // Simular el guardado en ENCUESTAS_FUNCIONARIOS
        const newEncuestaFuncionario = {
            ID: nextEncuestaFuncionarioId++,
            ID_ENCUESTA_PERIODO: parseInt(currentSurveyId),
            LEG_ID: 'FUNCIONARIO_X', // Esto debería venir del usuario logueado
            ID_ESTADO: isDraft ? 0 : 1, // 0 para borrador, 1 para enviado
            COMENTARIO: '' // Podría ser un comentario general si aplica
        };
        encuestasFuncionarios.push(newEncuestaFuncionario);

        // Simular el guardado en ENCUESTAS_RESPUESTAS
        surveyQuestions.forEach(question => {
            let idPreguntaItem = null;
            let comentario = null;

            if (question.tipo === 'radio_scale' || question.tipo === 'radio_text') {
                const selectedOption = document.querySelector(`input[name="question_${question.id}"]:checked`);
                if (selectedOption) {
                    idPreguntaItem = parseInt(selectedOption.value);
                }
            } else if (question.tipo === 'textarea') {
                const textarea = document.querySelector(`textarea[name="question_${question.id}"]`);
                if (textarea) {
                    comentario = textarea.value.trim();
                }
            }

            // Solo guardar respuestas para preguntas respondidas o si son obligatorias y no vacías
            if ((idPreguntaItem !== null || comentario !== null) || (!isDraft && question.obligatoria && (idPreguntaItem === null && comentario === null))) {
                 const newEncuestaRespuesta = {
                    ID: nextEncuestaRespuestaId++,
                    ID_ENCUESTA_FUNCIONARIO: newEncuestaFuncionario.ID,
                    ORDEN: question.orden,
                    ID_PREGUNTA: question.id,
                    ID_PREGUNTA_ITEM: idPreguntaItem, // Null si es textarea
                    COMENTARIO: comentario // Null si es radio
                };
                encuestasRespuestas.push(newEncuestaRespuesta);
            }
        });

        console.log('Encuestas Funcionarios:', encuestasFuncionarios);
        console.log('Encuestas Respuestas:', encuestasRespuestas);

        if (isDraft) {
            alert('Encuesta guardada como borrador.');
        } else {
            alert('Encuesta enviada con éxito.');
        }

        // Volver al listado de encuestas
        showSurveyList();
    }


    // --- Event Listeners ---

    newSurveyBtn.addEventListener('click', () => {
        // En un caso real, esto quizás abriría un formulario para crear una NUEVA encuesta,
        // no para responder una existente. Para este ejercicio, solo es un marcador.
        alert('Funcionalidad "Nueva Encuesta" no implementada completamente en este demo. Se carga el formulario de la primera encuesta por defecto para demostración.');
        loadSurveyForm(surveys[0].id); // Carga la primera encuesta para demostración
    });

    backBtnList.addEventListener('click', showSurveyList); // Aunque en esta pantalla no hace nada visualmente diferente, se mantiene por si se añadieran más vistas.

    rowsPerPageSelect.addEventListener('change', (e) => {
        rowsPerPage = parseInt(e.target.value);
        renderSurveyList(1); // Volver a la primera página al cambiar el número de filas por página
    });

    individualSurveyForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevenir el envío por defecto del formulario
        submitSurvey(false); // Enviar la encuesta (no como borrador)
    });

    saveDraftBtn.addEventListener('click', () => {
        submitSurvey(true); // Guardar como borrador
    });

    // --- Inicialización ---
    renderSurveyList(); // Cargar la lista de encuestas al inicio
});