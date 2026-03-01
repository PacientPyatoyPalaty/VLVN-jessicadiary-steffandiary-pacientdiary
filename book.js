document.addEventListener('DOMContentLoaded', () => {
    // === 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
    const fileSequence = ['html_0.html', 'html_1.html', 'html_2.html', 'html_3.html', 'html_4.html'];
    let particlesInterval;
    let currentPageIndex = 0;
    let pages = document.querySelectorAll('.page');
    const theme = document.getElementById('audio-hotline');

    const currentPath = window.location.pathname;
    let currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'html_0.html';
    const urlParams = new URLSearchParams(window.location.search);
    const startPage = urlParams.get('page');

    let touchStartX = 0;
    let touchEndX = 0;

    // === ИДЕАЛЬНАЯ МОДУЛЬНАЯ СИСТЕМА ТЕМ ===
    const allThemes = ['theme-patient', 'theme-doctor']; // Сюда потом впишем новые темы
    
    // Находим наши кнопки в меню
    const btnPatient = document.getElementById('theme-patient');
    const btnDoctor = document.getElementById('theme-doctor');

    // Универсальная функция переключения
    function switchTheme(newTheme) {
        // 1. Очищаем холст (сбрасываем все темы)
        document.body.classList.remove(...allThemes);
        
        // 2. Надеваем новую тему
        document.body.classList.add(newTheme);
        
        // 3. Сохраняем выбор в память браузера
        localStorage.setItem('activeSiteTheme', newTheme);

        // 4. Переключаем красивое свечение (класс .active) на кнопках меню
        if (btnPatient && btnDoctor) {
            btnPatient.classList.remove('active');
            btnDoctor.classList.remove('active');
            
            if (newTheme === 'theme-patient') btnPatient.classList.add('active');
            if (newTheme === 'theme-doctor') btnDoctor.classList.add('active');
        }
    }

    // Привязываем клики к кнопкам (если они есть на странице)
    if (btnPatient) {
        btnPatient.addEventListener('click', () => switchTheme('theme-patient'));
    }
    if (btnDoctor) {
        btnDoctor.addEventListener('click', () => switchTheme('theme-doctor'));
    }

    // Загрузка сохраненной темы при открытии (или Пациент по умолчанию)
    const activeSavedTheme = localStorage.getItem('activeSiteTheme') || 'theme-patient';
    switchTheme(activeSavedTheme);

    // === ПРЕДЗАГРУЗКА РЕСУРСОВ ===
    const assetsToPreload = [
        // Изображения портретов из разделов
       'cover-1.png','cover-2.png','cover-3.png','cover-4.png','cover-5.png','cover-6.png', 'cover-7.png', 'cover-8.png', 'cover-9.png', 'cover-10.png', 'cover-11.png', 'cover-12.png', 'cover-13.png', 'cover-14.png',
        // Звуковые эффекты
        'kviboruk.mp3', 'pr.mp3' 
    ];
    
    // === 2. ЗВУК И ЭФФЕКТЫ ===
    function playSound(id, volume = 0.5) {
        const sound = document.getElementById(id);
        if (sound) {
            sound.volume = volume;
            sound.currentTime = 0;
            sound.play().catch(() => {}); 
        }
    }

        function preloadAssets(list) {
        list.forEach(url => {
            if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.webp')) {
                const img = new Image();
                img.src = url;
            } else if (url.endsWith('.mp3') || url.endsWith('.wav')) {
                const audio = new Audio();
                audio.src = url;
            }
        });
    }

        function fadeAudioOut(audioElement) {
        if (!audioElement || audioElement.paused || audioElement.volume === 0) return;
        
        // Предохранитель: если звук уже затухает, убиваем старый таймер
        if (audioElement.fadeInterval) clearInterval(audioElement.fadeInterval);
        
        audioElement.fadeInterval = setInterval(() => {
            // Проверка на точность, чтобы не уйти в отрицательные значения
            if (audioElement.volume > 0.05) {
                // Из-за особенностей математики JS с дробями, лучше так:
                audioElement.volume = Math.max(0, audioElement.volume - 0.05);
            } else {
                audioElement.volume = 0;
                audioElement.pause();
                clearInterval(audioElement.fadeInterval);
            }
        }, 100);
    }

    function isGalleryClosed() {
        const gallery = document.getElementById('gallery-modal');
        return !gallery || gallery.style.display !== 'flex';
    }

    // === 3. БЛЁСТКИ ===
    function startParticles() {
        const container = document.getElementById('particles-container');
        if (!container) return;
        particlesInterval = setInterval(() => {
            const particle = document.createElement('div');
            particle.classList.add('gold-particle');
            const size = Math.random() * 4 + 2 + 'px';
            particle.style.width = size;
            particle.style.height = size;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.bottom = '-10px';
            const duration = Math.random() * 10 + 10 + 's';
            particle.style.animationDuration = duration;
            container.appendChild(particle);
            setTimeout(() => particle.remove(), parseFloat(duration) * 1000);
        }, 700);
    }

    function stopParticles() {
        if (particlesInterval) clearInterval(particlesInterval);
        const container = document.getElementById('particles-container');
        if (container) container.innerHTML = '';
    }

    // === 4. ЛОГИКА СТРАНИЦ И СОХРАНЕНИЕ ПРОГРЕССА ===
  function goToPage(index, animate = true) {
if (index < 0) {
        let currentFileIndex = fileSequence.indexOf(currentFile);
        if (currentFileIndex > 0) {
            transitionToFile(fileSequence[currentFileIndex - 1], 99);
        }
        return;
    }

    if (index >= pages.length) {
        let currentFileIndex = fileSequence.indexOf(currentFile);
        if (currentFileIndex < fileSequence.length - 1) {
            transitionToFile(fileSequence[currentFileIndex + 1], 0);
        }
        return;
    }
        
        if (animate && index !== currentPageIndex) {
            if (currentFile === 'html_0.html' && (index === 0 || currentPageIndex === 0)) {
                playSound('audio-cover-flip', 0.6);
            } else {
                playSound('audio-page-flip', 0.3);
            }
        }
        
        pages.forEach((page, i) => {
            page.classList.remove('active', 'flipped');
            if (i < index) page.classList.add('flipped');
        });
        
        if (pages[index]) pages[index].classList.add('active');
        currentPageIndex = index;
        
        // --- СОХРАНЕНИЕ В LOCALSTORAGE ---
        // Записываем текущий файл и страницу при каждом успешном переходе
        localStorage.setItem('jessica_diary_last_file', currentFile);
        localStorage.setItem('jessica_diary_last_page', index);
        // ---------------------------------
        
        const offset = parseInt(document.body.getAttribute('data-offset') || 0);
        const counter = document.getElementById('page-counter');
        if (counter) {
            counter.innerText = `-${index + 1 + offset}-`;
        }

        if (currentFile === 'html_0.html' && index >= 0) fadeAudioOut(theme);

        if (typeof updateSidebarHighlight === 'function') {
            updateSidebarHighlight(index);
        }
    }

    // === 5. УПРАВЛЕНИЕ ЭКРАНАМИ ===
    function showContent(instant = false) {
        const cover = document.getElementById('screen-cover');
        const content = document.getElementById('screen-content');
        if (!content) return;

        stopParticles();

        if (cover && cover.classList.contains('active')) {
            if (instant) {
                cover.classList.remove('active');
                cover.style.display = 'none';
                content.classList.add('active');
                content.style.opacity = '1';

resizeBook(); // <--- ДОБАВИТЬ СЮДА
            } else {
                cover.style.transition = 'transform 1.5s cubic-bezier(0.645, 0.045, 0.355, 1), opacity 1s ease';
                cover.style.transformOrigin = 'left center';
                cover.style.transform = 'perspective(2000px) rotateY(-100deg) scale(1.1)';
                cover.style.opacity = '0';
                
                setTimeout(() => {
                    cover.classList.remove('active');
                    cover.style.display = 'none';
                    content.classList.add('active');
resizeBook();
                    setTimeout(() => { content.style.opacity = '1'; }, 50);
                }, 1000);
            }
        } else {
            content.classList.add('active');
            content.style.opacity = '1';
resizeBook();
        }
    }

// === ФИНАЛЬНОЕ И ТОЧНОЕ МАСШТАБИРОВАНИЕ (Вариант Б: через rem) ===
function resizeBook() {
    const viewport = document.querySelector('.book-viewport');
    const book = document.querySelector('.art-book-container');
    
    if (!viewport || !book) return;

    // ПРОВЕРКА: Если это смартфон (экран <= 900px) — отключаем масштабирование
    if (window.innerWidth <= 900) {
        // Возвращаем дефолтный шрифт и контейнер на весь экран, 
        // чтобы твои родные свайпы и 3D-анимации работали как раньше!
        document.documentElement.style.fontSize = ''; 
        book.style.width = '100%';
        book.style.height = '100%'; 
        book.style.position = 'relative'; 
        book.style.left = '0';
        book.style.transform = 'none';
        return; // Выходим! Дальше мобилка работает по старым правилам
    }

    // --- ЛОГИКА ДЛЯ МОНИТОРОВ И ТВ (оставляем как было) ---
    const baseWidth = 830; 
    const baseHeight = 950; 

    const availW = viewport.clientWidth || (window.innerWidth - 370);
    const availH = viewport.clientHeight || window.innerHeight;

    const scale = Math.min(availW / baseWidth, availH / baseHeight) * 0.98;
    const finalScale = scale > 0 ? scale : 1;

    document.documentElement.style.fontSize = `${16 * finalScale}px`;

    book.style.position = 'absolute';
    book.style.top = '0'; 
    book.style.left = '50%'; 
    book.style.width = `${baseWidth / 16}rem`;
    book.style.height = `${baseHeight / 16}rem`;
    book.style.transformOrigin = 'top center';
    book.style.transform = `translateX(-50%)`;
}

// Оставляем слушатели в самом низу
resizeBook(); // Вызываем сразу при построении DOM
window.addEventListener('resize', resizeBook);
setTimeout(resizeBook, 300);

// === 6 и 7. ЛОГИКА САЙДБАРА, АККОРДЕОНА, МАРШРУТИЗАЦИИ И ЗОН НАВИГАЦИИ ===
    function attachDynamicEvents() {
        // Аккордеон
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        accordionHeaders.forEach(header => {
            header.onclick = function(e) {
                if(e.target.hasAttribute('data-target')) return; 

                const parentItem = this.parentElement; // Текущий <li>
                const wasActive = parentItem.classList.contains('active');
                const siblings = parentItem.parentElement.children;
                
                for (let sibling of siblings) {
                    if (sibling !== parentItem) {
                        sibling.classList.remove('active');
                    }
                }

                parentItem.classList.toggle('active', !wasActive);
            };
        });

        // Ссылки меню
        document.querySelectorAll('.submenu-list li[data-target]').forEach(link => {
            link.onclick = function(e) {
                e.stopPropagation();
                
                const targetFile = this.getAttribute('data-file');
                const targetPage = parseInt(this.getAttribute('data-target'));
                
                if (!targetFile || targetFile === currentFile) {
                    if (currentFile === 'html_0.html') showContent(false);
                    goToPage(targetPage);
                    
                    if (window.innerWidth <= 900) {
                        document.querySelector('.sidebar')?.classList.remove('mobile-open');
                        document.getElementById('mobile-menu-btn')?.classList.remove('active');
                    }
                } else {
                    // Закрываем мобильное меню при переходе на новую главу
                    if (window.innerWidth <= 900) {
                        document.querySelector('.sidebar')?.classList.remove('mobile-open');
                        document.getElementById('mobile-menu-btn')?.classList.remove('active');
                    }
                    
                    // Плавно подгружаем новый файл без потери Fullscreen
                    transitionToFile(targetFile, targetPage);
                }
            };
        });

        // Навигационные зоны
        const zonePrev = document.getElementById('zone-prev');
        const zoneNext = document.getElementById('zone-next');
        
        if (zonePrev) {
            zonePrev.onclick = () => {
                goToPage(currentPageIndex - 1);
            };
        }

        if (zoneNext) {
            zoneNext.onclick = () => {
                goToPage(currentPageIndex + 1);
            };
        }
    }

    // Инициализируем события при первой загрузке
    attachDynamicEvents();

// === 8. ИНИЦИАЛИЗАЦИЯ И ЗАПУСК (ЧТЕНИЕ ПРОГРЕССА) ===
    const btnTurnPage = document.getElementById('btn-turn-page');
    if (btnTurnPage) {
        btnTurnPage.addEventListener('click', () => {
            playSound('audio-cover-flip', 0.8);
            if (theme) fadeAudioOut(theme);

            const savedFile = localStorage.getItem('jessica_diary_last_file');
            const savedPage = localStorage.getItem('jessica_diary_last_page');

            if (savedFile && savedPage !== null && (savedFile !== 'html_0.html' || savedPage !== "0")) {
                if (savedFile === currentFile) {
                    showContent(false);
                    goToPage(parseInt(savedPage));
                } else {
                    document.body.style.transition = 'opacity 0.8s ease';
                    document.body.style.opacity = '0';
                    setTimeout(() => {
                        window.location.href = `${savedFile}?page=${savedPage}`;
                    }, 1200);
                }
            } else {
                showContent(false);
                goToPage(0); 
            }
        });
    }

// === 9. ГЛОБАЛЬНАЯ НАВИГАЦИЯ (КЛАВИАТУРА И СВАЙПЫ) ===

// 1. Объявляем переменные в начале (чтобы они были доступны всем функциям)
let touchStartY = 0;
let touchEndY = 0;

// Управление клавиатурой
document.addEventListener('keydown', (e) => {
    if (!isGalleryClosed()) return;
    if (e.key === 'ArrowLeft') {
        document.getElementById('zone-prev')?.click();
    } else if (e.key === 'ArrowRight') {
        document.getElementById('zone-next')?.click();
    }
});

// Начало касания
document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
}, { passive: true });

// Конец касания
document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;

    // Если галерея открыта — свайпы книги не работают
    if (!isGalleryClosed()) return;
    
    const swipeDistanceX = touchEndX - touchStartX;
    const swipeDistanceY = touchEndY - touchStartY;
    const swipeThreshold = 120; // Уверенный порог для «маха» пальцем

    // МАГИЯ ЗАЩИТЫ: 
    // Листаем только если:
    // 1. Длина маха по горизонтали больше порога (120px)
    // 2. Движение по горизонтали (X) минимум в ДВА раза сильнее, чем по вертикали (Y)
    // Это гарантирует, что обычный скролл вверх/вниз не перелистнет страницу
    if (Math.abs(swipeDistanceX) > swipeThreshold && Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) * 2) {
        if (swipeDistanceX < 0) {
            // Палец шел влево — страница вперед
            document.getElementById('zone-next')?.click();
        } else {
            // Палец шел вправо — страница назад
            document.getElementById('zone-prev')?.click();
        }
    }
}, { passive: true });


// === АВТОМАТИЧЕСКОЕ СКРЫТИЕ ПОДСКАЗКИ ПРИ ПОЛНОМ ЭКРАНЕ ===
document.addEventListener('fullscreenchange', () => {
    // Укажите здесь ID или класс вашей подсказки
    const f11Hint = document.querySelector('.f11-hint') || document.querySelector('.fullscreen-prompt'); 
    
    if (document.fullscreenElement) {
        // Если вошли в полноэкранный режим — плавно прячем
        if (f11Hint) {
            f11Hint.style.transition = 'opacity 0.5s ease';
            f11Hint.style.opacity = '0';
            // Полностью убираем из потока через полсекунды
            setTimeout(() => { f11Hint.style.display = 'none'; }, 500);
        }
    } else {
        // Если вышли из полноэкранного режима — возвращаем
        if (f11Hint) {
            f11Hint.style.display = 'block';
            setTimeout(() => { f11Hint.style.opacity = '1'; }, 50);
        }
    }
});

// === 10. МОБИЛЬНОЕ МЕНЮ И УПРАВЛЕНИЕ ОКНАМИ ===
const mobileBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.querySelector('.sidebar');
const bookViewport = document.querySelector('.book-viewport');

if (mobileBtn && sidebar) {
    // Открытие по кнопке
    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        sidebar.classList.toggle('mobile-open');
    });

    // 1. Закрытие свайпом влево по самому сайдбару
    let sidebarTouchStartX = 0;
    sidebar.addEventListener('touchstart', (e) => {
        sidebarTouchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    sidebar.addEventListener('touchend', (e) => {
        let sidebarTouchEndX = e.changedTouches[0].clientX;
        // Если палец скользнул влево более чем на 50 пикселей
        if (sidebarTouchStartX - sidebarTouchEndX > 50) {
            sidebar.classList.remove('mobile-open');
            mobileBtn.classList.remove('active');
        }
    }, { passive: true });

    // 2. Элегантное закрытие при касании мимо меню (по тексту книги)
    if (bookViewport) {
        bookViewport.addEventListener('click', () => {
            if (sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                mobileBtn.classList.remove('active');
            }
        });
    }
}

    // Кнопки возврата в меню
    document.getElementById('btn-to-main-landing')?.addEventListener('click', function() {
        playSound('audio-book-close', 0.8);
        if (theme) fadeAudioOut(theme);
        
        const mainLanding = document.getElementById('screen-0'); 
        if (mainLanding) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.style.display = 'none';
                screen.style.opacity = '0';
            });
            mainLanding.style.display = 'flex'; 
            setTimeout(() => { mainLanding.style.opacity = '1'; }, 50);
        } else {
          setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        }
        if (sidebar) sidebar.classList.remove('active');
    });

    document.getElementById('btn-back-to-menu')?.addEventListener('click', () => {
        playSound('audio-book-close', 0.8);
        if (theme) fadeAudioOut(theme);
          setTimeout(() => { window.location.href = 'index.html?skipIntro=true'; }, 1000);
    });

    // Фуллскрин
    document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen();
        }
    });

    // Галерея
    document.getElementById('open-gallery')?.addEventListener('click', () => {
        const gallery = document.getElementById('gallery-modal');
        if (gallery) {
            gallery.style.display = 'flex';
        }
    });

    document.addEventListener('click', function(event) {
        const gallery = document.getElementById('gallery-modal');
        if (!gallery || gallery.style.display !== 'flex') return;

        if (event.target.closest('#close-gallery') || 
            event.target.closest('#close-gallery-bottom') || 
            event.target.id === 'gallery-modal') {
            gallery.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' || event.key === 'Esc') {
            const gallery = document.getElementById('gallery-modal');
            if (gallery && gallery.style.display === 'flex') {
                gallery.style.display = 'none';
            }
        }
    });

    // === 11. ФИНАЛЬНОЕ РЕШЕНИЕ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ===
    if (startPage !== null || currentFile !== 'html_0.html') {
        showContent(true);
        let targetPage = parseInt(startPage) || 0;
        if (targetPage === 99) targetPage = pages.length - 1;
        goToPage(targetPage, false);
        } else {
        startParticles();
        // Запускаем предзагрузку, пока читатель любуется обложкой
        preloadAssets(assetsToPreload); 
        
        if (theme) {
            theme.volume = 0.6;
            theme.play().catch(() => {});
        }
    }

// === ФУНКЦИЯ ПЛАВНОГО ПЕРЕХОДА МЕЖДУ ФАЙЛАМИ ===
function transitionToFile(targetFileName, startPageIndex = 0) {
    // 1. Применяем класс затухания ко всему body
    document.body.classList.add('fade-out-site');

    // 2. Если мы уходим с главной обложки (html_0), ждем 1200мс (пока затихнет звук)
    // Если листаем обычные главы — переход быстрее (800мс)
    const delay = (currentFile === 'html_0.html') ? 1200 : 800; 
    
    // 3. Классический, надежный переход на новую страницу
    setTimeout(() => {
        window.location.href = `${targetFileName}?page=${startPageIndex}`;
    }, delay); 
}

// === УМНАЯ ПРЕДЗАГРУЗКА СЛЕДУЮЩЕЙ ГЛАВЫ ===
function preloadNextChapter() {
    // Находим, на каком файле мы сейчас
    const currentIndex = fileSequence.indexOf(currentFile);
    
    // Если мы не на последнем файле
    if (currentIndex !== -1 && currentIndex < fileSequence.length - 1) {
        const nextFile = fileSequence[currentIndex + 1];
        
        // Создаем скрытый линк для предзагрузки
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch'; // Команда браузеру: "скачай в фоне, скоро понадобится"
        prefetchLink.href = nextFile;
        
        // Добавляем в голову сайта
        document.head.appendChild(prefetchLink);
    }
}

// Запускаем предзагрузку следующей главы через 3 секунды после открытия текущей, 
// чтобы не тормозить начальную загрузку страницы
setTimeout(preloadNextChapter, 3000);

});