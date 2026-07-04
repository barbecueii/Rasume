document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. INTERACTIVE NEURAL NETWORK CANVAS BACKGROUND
       ========================================================================== */
    const canvas = document.getElementById('neuralCanvas');
    const ctx = canvas.getContext('2d');

    // ฟังก์ชันปรับขนาดเมตริกซ์ของ Canvas ให้เต็มจอและคมชัดอยู่เสมอ
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // อาเรย์เก็บตำแหน่งและค่าเวกเตอร์ของแต่ละจุดเชื่อมโยง (Node Particles)
    const particles = [];
    const particleCount = 65; // ปริมาณความหนาแน่นที่พอดี ไม่บดบังตัวหนังสือและไม่เปลือง CPU
    const maxDistance = 120;  // ระยะห่างสูงสุดในการคำนวณเส้นใยเชื่อมต่อ

    // พิกัดเมาส์สำหรับดึงดูดและทำปฏิกิริยากับหน้าจอ
    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // คลาสสร้างออบเจกต์จุดโครงข่าย
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.speedX = (Math.random() - 0.5) * 0.6; // ความเร็วแนวราบที่นุ่มนวล
            this.speedY = (Math.random() - 0.5) * 0.6; // ความเร็วแนวดิ่งที่นุ่มนวล
            this.radius = Math.random() * 2.5 + 1.5;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // ตรวจจับเมื่อชนขอบหน้าจอให้เด้งกลับอย่างเป็นธรรมชาติ
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(14, 165, 233, 0.25)'; // สีฟ้า Cyan จางๆ สบายตา
            ctx.fill();
        }
    }

    // เริ่มต้นสร้างชุดข้อมูลจุด Node
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // วงลูปแอนิเมชันสำหรับคำนวณระยะห่างเส้นเชื่อมโยงทางคณิตศาสตร์
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // เปรียบเทียบระยะห่างระหว่างจุดต่อจุด
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    // กำหนดความโปร่งใสของเส้นตามระยะทาง ยิ่งไกลยิ่งจาง
                    const alpha = (1 - (distance / maxDistance)) * 0.15;
                    ctx.strokeStyle = `rgba(14, 165, 233, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }

            // คำนวณความสัมพันธ์กับพิกัดเมาส์
            if (mouse.x !== null && mouse.y !== null) {
                const dxMouse = particles[i].x - mouse.x;
                const dyMouse = particles[i].y - mouse.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                if (distMouse < 180) {
                    const alpha = (1 - (distMouse / 180)) * 0.2;
                    ctx.strokeStyle = `rgba(15, 23, 42, ${alpha})`; // เส้นเข้าหาเมาส์ใช้สี Deep Blue จางๆ
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();


    /* ==========================================================================
       2. TYPING EFFECT (ลูกเล่นพิมพ์ตัวอักษรวิ่งเปลี่ยนตำแหน่งงาน)
       ========================================================================== */
    const typingText = document.getElementById('typing-text');
    const professions = ["LLM Developer", "Computer Vision Specialist", "Data Scientist", "AI Engineer"];
    let professionIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function handleTyping() {
        const currentString = professions[professionIndex];

        if (!isDeleting) {
            // โหมดกำลังพิมพ์ตัวอักษรเข้าไป
            typingText.textContent = currentString.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // ความเร็วปกติเมื่อพิมพ์ข้อมูล

            if (charIndex === currentString.length) {
                isDeleting = true;
                typingSpeed = 2000; // สต็อปคำทิ้งไว้สักครู่ให้ผู้ใช้งานอ่านทัน
            }
        } else {
            // โหมดกำลังลบตัวอักษรย้อนกลับ
            typingText.textContent = currentString.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // ลบคำให้เร็วขึ้น

            if (charIndex === 0) {
                isDeleting = false;
                professionIndex = (professionIndex + 1) % professions.length; // ขยับไปคำถัดไปในลิสต์
                typingSpeed = 500; // หน่วงเวลาก่อนเริ่มพิมพ์คำใหม่
            }
        }

        setTimeout(handleTyping, typingSpeed);
    }
    // เริ่มทำงานระบบพิมพ์อักษร
    setTimeout(handleTyping, 1000);


    /* ==========================================================================
       3. SMOOTH SCROLLING & ACTIVE LINK SYNC
       ========================================================================== */
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // คำนวณและเลื่อนหน้าจอลงไปแบบนุ่มนวลสูงสุดตามต้องการ
                const offsetTop = targetSection.offsetTop - 75; // หักลบความสูงของ Navbar แถบติดด้านบน
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // ปิดเมนูบนโมบายล์อัตโนมัติเมื่อกดเลือกเมนูแล้ว
                document.getElementById('mobile-menu').classList.remove('active');
                document.querySelector('.nav-menu').classList.remove('active');
            }
        });
    });

    // ตรวจสอบและเปลี่ยนสถานะ Active ของปุ่มตามพิกัด Scroll ปัจจุบัน
    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            if (scrollPosition >= section.offsetTop) {
                currentSectionId = '#' + section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSectionId) {
                link.classList.add('active');
            }
        });

        // ลูกเล่นเปลี่ยนความสูงและการเคลือบกระจกฝ้าเมื่อเลื่อนหน้าจอลงมา (Navbar Effect)
        const header = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    /* ==========================================================================
       4. MOBILE MENU TOGGLE SYSTEM
       ========================================================================== */
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });


    /* ==========================================================================
       5. CONTACT FORM SIMULATION & CUSTOM ALERT POPUP
       ========================================================================== */
    const contactForm = document.getElementById('contactForm');
    const customAlert = document.getElementById('customAlert');
    const closeAlertBtn = document.getElementById('closeAlert');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // ป้องกันหน้าจอโหลดข้อมูลใหม่ตามกลไกพื้นฐาน

            // ดึงค่าจำลองเผื่อนำไปประยุกต์ใช้งานจริง
            const nameValue = document.getElementById('name').value;
            const emailValue = document.getElementById('email').value;
            const messageValue = document.getElementById('message').value;

            // แสดง Custom Popup ที่เราดีไซน์ไว้แทน Alert ดั้งเดิมที่ดูไม่หรูหรา
            customAlert.classList.add('active');

            // รีเซ็ตล้างข้อมูลในฟอร์มทั้งหมดหลังการกดส่งเรียบร้อย
            contactForm.reset();
        });
    }

    // ปิดหน้าต่าง Pop-up สวยๆ
    if (closeAlertBtn) {
        closeAlertBtn.addEventListener('click', () => {
            customAlert.classList.remove('active');
        });
    }

    // เพิ่มเติมความพรีเมียม: คลิกพื้นที่ว่างนอกกรอบ Pop-up เพื่อปิดได้เช่นกัน
    customAlert.addEventListener('click', (e) => {
        if (e.target === customAlert) {
            customAlert.classList.remove('active');
        }
    });
});

