import { chat, saveChatDebounced, addOneMessage } from '../../../../script.js';

import { getContext } from '../../../extensions.js';

// Retrieve application context, including chat logs and participant info.
const context = getContext();
/**
 * Свайпы
 */

 // === 1. Закрепление свайпов ===
const pinCurrentSwipe = function(messageElement) {
    const mesId = Number(messageElement.closest(".mes").getAttribute("mesid"));
    const currentMessage = chat[mesId];
    if (!currentMessage) {
        showNotification('Ошибка: Сообщение не найдено.', 'error');
        return;
    }

    const isLastMessage = chat.indexOf(currentMessage) === chat.length - 1;
    if (!isLastMessage) {
        showNotification('нельзя...', 'error');
        return;
    }

    if (currentMessage.is_user) {
        showNotification('нельзя...', 'error');
        return;
    }

    if (!currentMessage.swipes) {
        showNotification('Нет доступных свайпов для закрепления.', 'error');
        return;
    }

    if (!currentMessage.pinnedSwipes) {
        currentMessage.pinnedSwipes = [];
    }

    const currentSwipeId = currentMessage.swipe_id;

    if (!currentMessage.pinnedSwipes.includes(currentSwipeId)) {
        currentMessage.pinnedSwipes.push(currentSwipeId);
        showNotification('Свайп успешно закреплён.', 'success');
    } else {
        showNotification('Этот свайп уже закреплён.', 'info');
    }

    saveChatDebounced(); // Сохраняем состояние чата сразу после закрепления
};




// Глобальная функция для обработки кликов вне меню
const handleOutsideClick = function(event) {
    const menuContainer = document.querySelector('.pinned-swipes-menu');
    if (!menuContainer) return;

    // Проверяем, сделан ли клик внутри меню
    const isClickInsideMenu = menuContainer.contains(event.target);

    if (!isClickInsideMenu) {
        closePinnedSwipesMenu();
        document.removeEventListener('click', handleOutsideClick); // Убираем обработчик после закрытия
    }
};


// === 2. Всплывающее меню закреплённых свайпов ===
const showPinnedSwipesMenu = function() {
    const lastMessage = chat[chat.length - 1];
    if (!lastMessage || !lastMessage.pinnedSwipes || lastMessage.pinnedSwipes.length === 0) {
        showNotification('Нет закреплённых свайпов.', 'info');
        return;
    }

    // Удаляем старое меню, если оно уже существует
    const existingMenu = document.querySelector('.pinned-swipes-menu');
    if (existingMenu) existingMenu.remove();

    // Загружаем настройки промпта
    loadPromptSettings();

    // Создаём контейнер для меню
    const menuContainer = document.createElement('div');
    menuContainer.className = 'pinned-swipes-menu';
    menuContainer.style.position = 'fixed';
    menuContainer.style.top = '10%';
    menuContainer.style.left = '50%';
    menuContainer.style.transform = 'translate(-50%, 0)';
    menuContainer.style.background = '#2c2f33';
    menuContainer.style.border = '1px solid #23272a';
    menuContainer.style.padding = '20px';
    menuContainer.style.zIndex = '1000';
    menuContainer.style.maxHeight = '80%';
    menuContainer.style.overflowY = 'auto';
    menuContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
    menuContainer.style.borderRadius = '10px';
    menuContainer.style.width = '800px';
    menuContainer.style.opacity = '0';
    menuContainer.style.transition = 'opacity 0.3s ease';

    // Массив выбранных свайпов
    const selectedSwipes = [];

    // Поле поиска
    const searchContainer = document.createElement('div');
    searchContainer.style.display = 'flex';
    searchContainer.style.justifyContent = 'space-between';
    searchContainer.style.alignItems = 'center';
    searchContainer.style.marginBottom = '15px';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Поиск по всем свайпам...';
    searchInput.style.flex = '1';
    searchInput.style.padding = '10px';
    searchInput.style.border = '1px solid #23272a';
    searchInput.style.borderRadius = '4px';
    searchInput.style.marginRight = '10px';
    searchInput.style.background = '#23272a';
    searchInput.style.color = '#ffffff';

    const searchButton = document.createElement('div'); // Иконка вместо кнопки
    searchButton.innerHTML = '🔍'; // Иконка поиска
    searchButton.style.padding = '10px';
    searchButton.style.cursor = 'pointer';
    searchButton.style.display = 'flex';
    searchButton.style.alignItems = 'center';
    searchButton.style.justifyContent = 'center';
    searchButton.style.color = '#2ecc71'; // Цвет иконки
    searchButton.style.fontSize = '20px'; // Размер иконки

    searchButton.onclick = () => {
        const searchText = searchInput.value.trim();
        if (!searchText) {
            showNotification('Введите текст для поиска.', 'info');
            return;
        }

        const foundSwipeId = Object.entries(lastMessage.swipes).find(([id, text]) =>
            text.replace(/\s+/g, ' ').includes(searchText)
        );

        if (foundSwipeId) {
            const [swipeId] = foundSwipeId;
            goToPinnedSwipe(Number(swipeId));
            showNotification(`Найдено совпадение в свайпе #${Number(swipeId) + 1}.`, 'success');
            closePinnedSwipesMenu();
        } else {
            showNotification('Совпадений не найдено.', 'error');
        }
    };

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    menuContainer.appendChild(searchContainer);

    // Добавляем каждый закреплённый свайп
    lastMessage.pinnedSwipes.forEach((swipeId, index) => {
        // Создаём swipeMessage для рендеринга
        const swipeMessage = { ...lastMessage, mes: lastMessage.swipes[swipeId], swipe_id: swipeId };

        // Используем getMessageFromTemplate для создания jQuery-объекта
        const renderedMessageJQuery = window.getMessageFromTemplate({
            mesId: swipeId,
            characterName: lastMessage.name,
            isUser: lastMessage.is_user,
			const avatarImg = (window.getThumbnailUrl || getThumbnailUrl)('avatar', window.characters[window.this_chid]?.avatar || 'default.png');
            timestamp: lastMessage.swipe_info?.[swipeId]?.send_date || lastMessage.send_date,
            extra: lastMessage.extra,
            tokenCount: lastMessage.extra?.token_count ?? 0,
        });

        // Преобразуем jQuery-объект в DOM-узел
        const renderedMessage = renderedMessageJQuery[0];

        // Обновляем текст и форматирование
        const messageText = lastMessage.swipes[swipeId];
        const formattedText = messageFormatting(
            messageText,
            lastMessage.name,
            lastMessage.is_system,
            lastMessage.is_user,
            swipeId
        );
        const messageTextElement = renderedMessage.querySelector('.mes_text');
        if (messageTextElement) {
            messageTextElement.innerHTML = formattedText;
            messageTextElement.style.maxHeight = '150px';
            messageTextElement.style.overflowY = 'auto';
        }

        // Добавляем Swipe ID под аватаркой
        const avatarWrapper = renderedMessage.querySelector('.mesAvatarWrapper');
        if (avatarWrapper) {
            const swipeIdElement = document.createElement('div');
            swipeIdElement.textContent = `#${parseInt(swipeId) + 1}`;
            swipeIdElement.style.fontSize = '12px';
            swipeIdElement.style.color = '#ffffff';
            swipeIdElement.style.textAlign = 'center';
            swipeIdElement.style.marginTop = '5px';
            avatarWrapper.appendChild(swipeIdElement);
        }

        // Добавляем иконки "Перейти" и "Удалить" под аватаркой
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.marginTop = '10px';
        buttonsContainer.style.textAlign = 'center';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'center';
        buttonsContainer.style.alignItems = 'center';

        const goToButton = document.createElement('i');
        goToButton.className = 'fa-solid fa-arrow-right';
        goToButton.style.color = '#2ecc71';
        goToButton.style.cursor = 'pointer';
        goToButton.style.marginRight = '10px';
        goToButton.title = 'Перейти к свайпу';
        goToButton.onclick = () => goToPinnedSwipe(swipeId);

        const deleteButton = document.createElement('i');
        deleteButton.className = 'fa-solid fa-skull';
        deleteButton.style.color = '#e74c3c';
        deleteButton.style.cursor = 'pointer';
        deleteButton.title = 'Удалить свайп';
        deleteButton.setAttribute('data-menu-ignore', 'true'); // Добавляем атрибут
        deleteButton.onclick = (event) => {
            event.stopPropagation(); // Останавливаем всплытие события
            removePinnedSwipe(swipeId);
        };

        buttonsContainer.appendChild(goToButton);
        buttonsContainer.appendChild(deleteButton);
        avatarWrapper.appendChild(buttonsContainer);

        // Создаём чекбокс
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'swipe-checkbox';
        checkbox.style.marginTop = '10px';
        checkbox.style.display = 'block';
        checkbox.style.margin = '10px auto'; // Центрируем чекбокс



        // Создаём элемент для отображения номера порядка
        const orderNumber = document.createElement('div');
        orderNumber.className = 'order-number';
        orderNumber.style.textAlign = 'center';
        orderNumber.style.color = '#ffffff';
        orderNumber.style.fontSize = '12px';
        orderNumber.style.marginTop = '5px';
        orderNumber.style.display = 'none'; // Скрыт по умолчанию

        // Создаём контейнер для чекбокса
        const checkboxContainer = document.createElement('div');
        checkboxContainer.style.textAlign = 'center';

        // Добавляем чекбокс и номер в контейнер
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(orderNumber);

        // Добавляем контейнер чекбокса под кнопками
        avatarWrapper.appendChild(checkboxContainer);

        // Добавляем обработчик события для чекбокса
        checkbox.addEventListener('change', (event) => handleSwipeSelection(event, swipeContainer));

        // Сохраняем текст сообщения и ID свайпа
        const swipeContainer = document.createElement('div');
        swipeContainer.className = 'swipe-container';
        swipeContainer.style.display = 'flex';
        swipeContainer.style.alignItems = 'flex-start';
        swipeContainer.style.marginBottom = '15px';
        swipeContainer.style.borderBottom = '1px solid #23272a'; // Линия между свайпами
        swipeContainer.style.paddingBottom = '15px';

        swipeContainer.messageText = messageText;
        swipeContainer.dataset.swipeId = swipeId;

        // Создаём под-контейнер для сообщения
        const messageAndButtonsContainer = document.createElement('div');
        messageAndButtonsContainer.style.display = 'flex';
        messageAndButtonsContainer.style.flexDirection = 'column';
        messageAndButtonsContainer.style.flex = '1'; // Позволяем расширяться

        // Добавляем отрендеренное сообщение в под-контейнер
        messageAndButtonsContainer.appendChild(renderedMessage);

        // Добавляем под-контейнер в контейнер свайпа
        swipeContainer.appendChild(messageAndButtonsContainer);

        // Добавляем контейнер свайпа в меню
        menuContainer.appendChild(swipeContainer);
    });

    // Редактор промпта
    const promptEditorContainer = document.createElement('div');
    promptEditorContainer.style.display = 'flex';
    promptEditorContainer.style.flexDirection = 'column';
    promptEditorContainer.style.marginTop = '15px';

    // Начальный промпт
    const initialPromptLabel = document.createElement('label');
    initialPromptLabel.textContent = 'Начальный промпт:';
    initialPromptLabel.style.color = '#ffffff';
    initialPromptLabel.style.marginBottom = '8px';

    const initialPromptInput = document.createElement('textarea');
    initialPromptInput.value = promptSettings.initialPrompt;
    initialPromptInput.style.width = '100%';
    initialPromptInput.style.height = '60px';
    initialPromptInput.style.marginBottom = '10px';

    // Разделитель
    const separatorLabel = document.createElement('label');
    separatorLabel.textContent = 'Разделитель между свайпами:';
    separatorLabel.style.color = '#ffffff';
    separatorLabel.style.marginBottom = '5px';

    const separatorInput = document.createElement('textarea');
    separatorInput.value = promptSettings.separator;
    separatorInput.style.width = '100%';
    separatorInput.style.height = '60px';
    separatorInput.style.marginBottom = '10px';

    // Промпт в конце
    const finalPromptLabel = document.createElement('label');
    finalPromptLabel.textContent = 'Промпт в конце:';
    finalPromptLabel.style.color = '#ffffff';
    finalPromptLabel.style.marginBottom = '5px';

    const finalPromptInput = document.createElement('textarea');
    finalPromptInput.value = promptSettings.finalPrompt;
    finalPromptInput.style.width = '100%';
    finalPromptInput.style.height = '60px';
    finalPromptInput.style.marginBottom = '10px';

	// Кнопка сохранения настроек промпта
	const savePromptButton = document.createElement('button');
	savePromptButton.className = 'menu-button save-prompt-button'; // Используем CSS класс
	savePromptButton.textContent = 'Сохранить настройки'; // Текст кнопки
	savePromptButton.title = 'Сохранить настройки промпта'; // Подсказка
	savePromptButton.onclick = () => {
		promptSettings.initialPrompt = initialPromptInput.value;
		promptSettings.separator = separatorInput.value;
		promptSettings.finalPrompt = finalPromptInput.value;
		savePromptSettings();
		showNotification('Настройки промпта сохранены.', 'success');
	};

	// Кнопка отправки выбранных свайпов
	const sendButton = document.createElement('button');
	sendButton.className = 'menu-button send-swipes-button'; // Используем CSS класс
	sendButton.textContent = 'Отправить выбранные'; // Текст кнопки
	sendButton.title = 'Отправить выбранные свайпы'; // Подсказка
	sendButton.onclick = () => sendSelectedSwipes(selectedSwipes); // Логика клика

	// Создаём контейнер для обеих кнопок
	const buttonsContainer = document.createElement('div');
	buttonsContainer.className = 'buttons-container'; // Общий класс для контейнера кнопок
	buttonsContainer.appendChild(savePromptButton); // Добавляем кнопку "Сохранить"
	buttonsContainer.appendChild(sendButton); // Добавляем кнопку "Отправить"

	// Добавляем всё в контейнер редактора промпта
	promptEditorContainer.appendChild(initialPromptLabel);
	promptEditorContainer.appendChild(initialPromptInput);
	promptEditorContainer.appendChild(separatorLabel);
	promptEditorContainer.appendChild(separatorInput);
	promptEditorContainer.appendChild(finalPromptLabel);
	promptEditorContainer.appendChild(finalPromptInput);

	// Добавляем общий контейнер с кнопками в редактор промпта
	promptEditorContainer.appendChild(buttonsContainer);

	// Добавляем редактор промпта в меню
	menuContainer.appendChild(promptEditorContainer);

	// Добавляем меню в DOM
	document.body.appendChild(menuContainer);


    // Анимация появления
    setTimeout(() => {
        menuContainer.style.opacity = '1';
    }, 10);


    // Закрытие меню при клике вне его области
    setTimeout(() => {
		const handleOutsideClick = (event) => {
			// Проверяем, сделан ли клик внутри меню
			const isClickInsideMenu = menuContainer.contains(event.target);

			if (isClickInsideMenu) {
				event.stopPropagation(); // Остановить всплытие события
				return;
			}

			closePinnedSwipesMenu();
			document.removeEventListener('click', handleOutsideClick);
		};

		
		setTimeout(() => {
			document.addEventListener('click', handleOutsideClick); // Используем глобальную функцию
		}, 100);

		// Глушим клики внутри самого меню
		menuContainer.addEventListener('click', (event) => {
			event.stopPropagation(); // Остановка всплытия событий внутри меню
		});
	}, 100);


    // Функция для обработки выбора свайпа
    function handleSwipeSelection(event, swipeContainer) {
        const checkbox = event.target;
        const orderNumber = checkbox.nextSibling; // Получаем элемент orderNumber

        if (checkbox.checked) {
            selectedSwipes.push({
                swipeId: swipeContainer.dataset.swipeId,
                order: selectedSwipes.length + 1,
                message: swipeContainer.messageText,
                swipeContainer: swipeContainer,
            });

            // Отображаем номер порядка
            orderNumber.textContent = selectedSwipes.length;
            orderNumber.style.display = 'block';
        } else {
            // Удаляем из selectedSwipes
            const index = selectedSwipes.findIndex(s => s.swipeId === swipeContainer.dataset.swipeId);
            if (index > -1) {
                selectedSwipes.splice(index, 1);
                // Очищаем номер порядка
                orderNumber.textContent = '';
                orderNumber.style.display = 'none';
                // Обновляем номера порядков
                updateOrderIndicators();
            }
        }
    }

    // Функция для обновления индикаторов порядка
    function updateOrderIndicators() {
        selectedSwipes.forEach((swipe, index) => {
            swipe.order = index + 1;
            const checkbox = swipe.swipeContainer.querySelector('.swipe-checkbox');
            const orderNumber = checkbox.nextSibling;
            if (orderNumber) {
                orderNumber.textContent = swipe.order;
            }
        });
    }
};

// Функции для загрузки и сохранения настроек промпта
function loadPromptSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('promptSettings'));
    if (savedSettings) {
        promptSettings = savedSettings;
    }
}

function savePromptSettings() {
    localStorage.setItem('promptSettings', JSON.stringify(promptSettings));
}

// Настройки промпта по умолчанию
let promptSettings = {
    initialPrompt: 'Pause.',
    separator: 'Свайп',
    finalPrompt: '',
};

const closePinnedSwipesMenu = function() {
    const menu = document.querySelector('.pinned-swipes-menu');
    if (menu) {
        menu.style.opacity = '0'; // Анимация исчезновения
        setTimeout(() => {
            menu.remove();
        }, 300);
    }

    // Удаляем обработчик кликов вне меню
    document.removeEventListener('click', handleOutsideClick);
};



const goToPinnedSwipe = function(swipeId) {
    const lastMessage = chat[chat.length - 1];
    if (!lastMessage || !lastMessage.swipes) return;

    lastMessage.swipe_id = swipeId;
    lastMessage.mes = lastMessage.swipes[swipeId];
    saveChatDebounced();
    addOneMessage(lastMessage, { type: 'swipe' });
	document.removeEventListener('click', handleOutsideClick);
    closePinnedSwipesMenu();
};

const removePinnedSwipe = function(swipeId) {
    const lastMessage = chat[chat.length - 1];
    if (!lastMessage || !lastMessage.pinnedSwipes) return;

    lastMessage.pinnedSwipes = lastMessage.pinnedSwipes.filter(id => id !== swipeId);

    const swipeContainer = document.querySelector(`[data-swipe-id="${swipeId}"]`);
    if (swipeContainer) {
        swipeContainer.classList.add('swipe-container-removing');
        setTimeout(() => {
            swipeContainer.remove();

            if (lastMessage.pinnedSwipes.length === 0) {
                closePinnedSwipesMenu();
                showNotification('Закреплённый свайп удалён. Нет закреплённых свайпов.', 'info');
                return;
            }
        }, 500);
    }

    saveChatDebounced(); // Сохраняем состояние чата сразу после удаления свайпа
    showNotification('Закреплённый свайп удалён.', 'success');
};







// Функция для форматирования выбранных свайпов
function formatSelectedSwipes(swipes) {
    let formattedMessage = promptSettings.initialPrompt;

    swipes.forEach((swipe, index) => {
        formattedMessage += `${promptSettings.separator} ${index + 1}\n${swipe.message}\n===\n`;
    });

    formattedMessage += promptSettings.finalPrompt;

    return formattedMessage;
}

// Функция для отправки выбранных свайпов как комбинированное сообщение
function sendSelectedSwipes(selectedSwipes) {
    if (selectedSwipes.length === 0) {
        showNotification('Свайпы не выбраны.', 'error');
        return;
    }

    // Сортируем свайпы по порядку
    selectedSwipes.sort((a, b) => a.order - b.order);

    // Форматируем сообщение
    const combinedMessage = formatSelectedSwipes(selectedSwipes);

    // Отправляем сообщение в нейросеть от имени пользователя
    sendMessageAsUser(combinedMessage);

    // Закрываем меню
    closePinnedSwipesMenu();
	
	document.removeEventListener('click', handleOutsideClick);

}

// === 3. Уведомления ===
const showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db';
    notification.style.color = '#fff';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '1000';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
};

// === Добавление кнопок в интерфейс ===
function addButtonsToInterface() {
    const extraButtonsContainer = document.querySelector('.extraMesButtons');
    if (!extraButtonsContainer) {
        console.log('Контейнер .extraMesButtons не найден.');
        return;
    }

    // Проверяем, не были ли кнопки уже добавлены
    if (extraButtonsContainer.querySelector('.mes_pin')) {
        console.log('Кнопки уже добавлены.');
        return;
    }

    // Создаём кнопку "Pin current swipe"
    const pinButton = document.createElement('div');
    pinButton.className = 'mes_button mes_pin fa-solid fa-thumbtack interactable';
    pinButton.title = 'Pin current swipe';
    pinButton.tabIndex = 0; // Добавляем возможность фокусировки кнопки
    pinButton.setAttribute('onclick', 'pinCurrentSwipe(this)'); // Добавляем атрибут onclick

    // Создаём кнопку "Show pinned swipes"
    const menuButton = document.createElement('div');
    menuButton.className = 'mes_button mes_pinned_menu fa-solid fa-list interactable';
    menuButton.title = 'Show pinned swipes';
    menuButton.tabIndex = 0; // Добавляем возможность фокусировки кнопки
    menuButton.setAttribute('onclick', 'showPinnedSwipesMenu()'); // Добавляем атрибут onclick

    // Добавляем кнопки в контейнер
    extraButtonsContainer.appendChild(pinButton);
    extraButtonsContainer.appendChild(menuButton);

    console.log('Кнопки успешно добавлены в интерфейс.');
}



// === Наблюдение за изменениями в DOM ===
function observeInterfaceChanges() {
    const observer = new MutationObserver(() => {
        const extraButtonsContainer = document.querySelector('.extraMesButtons');
        if (extraButtonsContainer) {
            addButtonsToInterface();
        }
    });

    // Наблюдаем за изменениями в теле документа
    observer.observe(document.body, { childList: true, subtree: true });
}
// Привязываем функции к window, чтобы они были доступны глобально
window.pinCurrentSwipe = pinCurrentSwipe;
window.showPinnedSwipesMenu = showPinnedSwipesMenu;
window.showNotification = showNotification;
window.closePinnedSwipesMenu = closePinnedSwipesMenu;
window.goToPinnedSwipe = goToPinnedSwipe;
window.removePinnedSwipe = removePinnedSwipe;

// Запускаем наблюдатель
observeInterfaceChanges();