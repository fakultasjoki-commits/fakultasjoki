document.addEventListener('DOMContentLoaded',()=>{
  // Navbar scroll
  const navbar=document.getElementById('navbar');
  const onScroll=()=>navbar.classList.toggle('navbar--scrolled',window.scrollY>40);
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  // Hamburger
  const ham=document.getElementById('hamburger');
  const menu=document.getElementById('navMenu');
  ham.addEventListener('click',()=>{
    const open=menu.classList.toggle('is-open');
    ham.classList.toggle('is-open',open);
    ham.setAttribute('aria-expanded',String(open));
    document.body.style.overflow=open?'hidden':'';
  });
  document.querySelectorAll('.nav-link').forEach(l=>l.addEventListener('click',()=>{
    menu.classList.remove('is-open');ham.classList.remove('is-open');
    ham.setAttribute('aria-expanded','false');document.body.style.overflow='';
  }));
  document.addEventListener('click',e=>{
    if(!navbar.contains(e.target)&&menu.classList.contains('is-open')){
      menu.classList.remove('is-open');ham.classList.remove('is-open');
      ham.setAttribute('aria-expanded','false');document.body.style.overflow='';
    }
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href');
      if(id==='#')return;
      const el=document.querySelector(id);
      if(!el)return;
      e.preventDefault();
      const top=el.getBoundingClientRect().top+window.scrollY-68;
      window.scrollTo({top,behavior:'smooth'});
    });
  });

  // FAQ
  const faqItems=document.querySelectorAll('.faq__item');
  faqItems.forEach(item=>{
    item.querySelector('.faq__question').addEventListener('click',()=>{
      const open=item.classList.contains('is-open');
      faqItems.forEach(i=>i.classList.remove('is-open'));
      faqItems.forEach(i=>i.querySelector('.faq__question').setAttribute('aria-expanded','false'));
      if(!open){item.classList.add('is-open');item.querySelector('.faq__question').setAttribute('aria-expanded','true')}
    });
  });

  // Testimoni Slider
  // Catatan: perhitungan translate dibuat berbasis PIXEL (bukan persentase),
  // jadi tetap presisi di semua ukuran layar/breakpoint dan saat resize.
  const track=document.getElementById('testiTrack');
  const dotsWrap=document.getElementById('testiDots');
  const prevBtn=document.getElementById('testiPrev');
  const nextBtn=document.getElementById('testiNext');

  if(track){
    const wrap=track.parentElement;
    const cards=Array.from(track.querySelectorAll('.testi-card'));
    const gap=20; // harus sinkron dengan CSS .testi-track { gap: 20px }
    let cur=0;
    let timer;

    // Berapa kartu yang tampil sekaligus, berdasarkan lebar kartu real di DOM
    const getVisible=()=>{
      if(!cards.length) return 1;
      const cardWidth=cards[0].getBoundingClientRect().width;
      const wrapWidth=wrap.getBoundingClientRect().width;
      if(cardWidth<=0) return 1;
      return Math.max(1, Math.round((wrapWidth + gap) / (cardWidth + gap)));
    };

    const pages=()=>Math.max(1, Math.ceil(cards.length / getVisible()));

    const buildDots=()=>{
      dotsWrap.innerHTML='';
      const total=pages();
      for(let i=0;i<total;i++){
        const d=document.createElement('button');
        d.className='slider-dot'+(i===cur?' is-active':'');
        d.setAttribute('aria-label',`Halaman ${i+1}`);
        d.addEventListener('click',()=>{go(i);reset()});
        dotsWrap.appendChild(d);
      }
    };

    const go=p=>{
      const total=pages();
      cur=Math.max(0, Math.min(p, total-1));
      const visible=getVisible();
      const cardWidth=cards[0].getBoundingClientRect().width;
      // Geser per "halaman" (sejumlah kartu visible), dalam satuan piksel
      const offsetPx=cur*visible*(cardWidth+gap);
      track.style.transform=`translateX(-${offsetPx}px)`;
      dotsWrap.querySelectorAll('.slider-dot').forEach((d,i)=>d.classList.toggle('is-active', i===cur));
    };

    const reset=()=>{
      clearInterval(timer);
      timer=setInterval(()=>go((cur+1)%pages()), 5000);
    };

    prevBtn.addEventListener('click',()=>{go((cur-1+pages())%pages());reset()});
    nextBtn.addEventListener('click',()=>{go((cur+1)%pages());reset()});

    // Swipe mobile
    let touchStartX=0;
    track.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX},{passive:true});
    track.addEventListener('touchend',e=>{
      const dx=touchStartX-e.changedTouches[0].clientX;
      if(Math.abs(dx)>50){
        dx>0 ? go((cur+1)%pages()) : go((cur-1+pages())%pages());
        reset();
      }
    });

    track.addEventListener('mouseenter',()=>clearInterval(timer));
    track.addEventListener('mouseleave',reset);

    // Rebuild saat resize (debounce), supaya perhitungan visible/pages tetap akurat
    let resizeTimer;
    window.addEventListener('resize',()=>{
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(()=>{
        cur=0;
        buildDots();
        go(0);
      },150);
    });

    buildDots();
    go(0);
    reset();
  }

  // Scroll top
  const stBtn=document.getElementById('scrollTop');
  window.addEventListener('scroll',()=>stBtn.classList.toggle('is-visible',window.scrollY>400),{passive:true});
  stBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Scroll reveal
  const revealEls=document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target)}});
  },{threshold:.1,rootMargin:'0px 0px -40px 0px'});
  revealEls.forEach(el=>obs.observe(el));
});