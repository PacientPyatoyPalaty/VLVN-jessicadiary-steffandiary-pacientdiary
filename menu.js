document.addEventListener('DOMContentLoaded', () => {

// === ЛОГИКА ВОЗВРАТА ИЗ КНИГИ ===
    if (window.location.search.includes('skipIntro=true')) {
        // Скрываем Интро
        const intro = document.getElementById('screen-intro');
        if (intro) {
            intro.classList.remove('active');
            intro.style.display = 'none';
        }
        // Сразу показываем Выбор книг
        const menu = document.getElementById('screen-menu');
        if (menu) {
            menu.classList.add('active');
            menu.style.opacity = '1';
        }
    }

    // Функция переключения экранов
    function switchScreen(fromId, toId) {
        const from = document.getElementById(fromId);
        const to = document.getElementById(toId);
        if (!from || !to) return;
        
        from.style.opacity = '0';
        setTimeout(() => {
            from.classList.remove('active');
            to.classList.add('active');
            setTimeout(() => { to.style.opacity = '1'; }, 50);
        }, 1000);
    }

    // Экран 1: Погружение
    const btnDive = document.getElementById('btn-dive');
    if (btnDive) {
        btnDive.addEventListener('click', () => {
            const intro = document.getElementById('screen-intro');
            const loading = document.getElementById('screen-loading');

            // Убираем анимацию появления у экрана загрузки, чтобы он возник мгновенно
            loading.style.transition = 'none'; 
            loading.classList.add('active');
            loading.style.opacity = '1';

            // Запускаем имена в ту же миллисекунду
            startGlitchEffect();

            // А интро пусть плавно уезжает (zoom)
            intro.classList.add('diving-through');
            setTimeout(() => {
                intro.classList.remove('active', 'diving-through');
                intro.style.opacity = '0';
                // Возвращаем плавность экранам для следующих переходов
                loading.style.transition = 'opacity 1.5s ease-in-out';
            }, 1000);
        });
    }

    // Эффект загрузки (Имена + переход)
    function startGlitchEffect() {
        const names = ["Джессика", "Фрэнсис", "Альба", "Кристиан", "Джон", "Вероника", "Диана", "Марго", "Стефан", "Эллис", "Алиса", "Элиза"];
        const loading = document.getElementById('screen-loading');
        
        // Создаем интервал вылета имен
        let interval = setInterval(() => {
            const span = document.createElement('span');
            span.classList.add('floating-name');
            span.innerText = names[Math.floor(Math.random() * names.length)];
            span.style.left = Math.random() * 100 + '%';
            span.style.top = Math.random() * 100 + '%';
            span.style.fontSize = (Math.random() * 2 + 1.5) + 'rem';
            const duration = Math.random() * 2 + 2.5;
            span.style.animationDuration = duration + 's';
            span.addEventListener('animationend', () => span.remove());
            loading.appendChild(span);
            setTimeout(() => span.remove(), duration * 1000);
        }, 80);

        // Останавливаем через 3 секунды и переходим в меню
        setTimeout(() => {
            clearInterval(interval);
            setTimeout(() => {
                switchScreen('screen-loading', 'screen-menu');
            }, 2500); // Ждем пока последние имена долетят
        }, 3000);
    }

// === ПРЕДЗАГРУЗКА ВСТУПЛЕНИЯ КНИГИ ===
    // Как только меню загрузилось, тихонько скачиваем файл html_0.html
    setTimeout(() => {
        const prefetchHtml0 = document.createElement('link');
        prefetchHtml0.rel = 'prefetch';
        prefetchHtml0.href = 'html_0.html';
        document.head.appendChild(prefetchHtml0);
    }, 2000); // Ждем 2 секунды после входа, чтобы не тормозить анимации меню

// === КЛИК ПО КНИГЕ 1 -> ПЛАВНЫЙ ПЕРЕХОД ===
    const book1 = document.getElementById('book-1');
    if (book1) {
        book1.addEventListener('click', () => {
            const menu = document.getElementById('screen-menu');
            menu.style.opacity = '0'; // Плавно гасим меню
            
            setTimeout(() => {
                // Переходим на загруженный в кэш файл
                window.location.href = 'html_0.html';
            }, 1000); // Ждем 1 секунду, пока идет затухание
        });
    }

});