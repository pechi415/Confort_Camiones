import React from 'react';
import { LayoutDashboard, Truck, Plus, Clock, Users } from 'lucide-react';

const MobileNavigation = ({
  mobileTabs,
  activeTab,
  setActiveTab,
  isDraggingNav,
  setIsDraggingNav,
  navTouchX,
  setNavTouchX,
  navVelocity,
  setNavVelocity,
  lastTouchX,
  navRef,
  jumpStretch,
  setJumpStretch,
  jumpSkew,
  setJumpSkew,
  activeIndex,
  itemWidthPct
}) => {
  
  const handleTouchStart = (e) => {
    setIsDraggingNav(true);
    const x = e.touches[0].clientX;
    setNavTouchX(x);
    lastTouchX.current = x;
    setNavVelocity(0);
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    setNavTouchX(currentX);

    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect();
      const relativeX = currentX - rect.left;
      const totalWidth = rect.width;
      const pct = (relativeX / totalWidth) * 100;
      const newIndex = Math.max(0, Math.min(mobileTabs.length - 1, Math.floor(pct / itemWidthPct)));

      if (mobileTabs[newIndex] !== activeTab) {
        setActiveTab(mobileTabs[newIndex]);
      }
    }

    const delta = currentX - lastTouchX.current;
    setNavVelocity(prev => prev * 0.7 + delta * 0.3);
    lastTouchX.current = currentX;
  };

  const handleTouchEnd = (e) => {
    setIsDraggingNav(false);
    setNavVelocity(0);
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const relativeX = navTouchX - rect.left;
    const totalWidth = rect.width;
    const pct = (relativeX / totalWidth) * 100;
    const newIndex = Math.max(0, Math.min(mobileTabs.length - 1, Math.floor(pct / itemWidthPct)));
    setActiveTab(mobileTabs[newIndex]);
  };

  const handleTabClick = (tab, targetIdx) => {
    const distance = targetIdx - activeIndex;
    if (distance === 0) return;

    setActiveTab(tab);

    const direction = Math.sign(distance);
    const intensity = Math.min(Math.abs(distance) * 0.15, 0.5);

    setJumpStretch(1 + intensity);
    setJumpSkew(direction * intensity * 30);

    setTimeout(() => {
      setJumpStretch(1);
      setJumpSkew(0);
    }, 300);
  };

  const getTabInfo = (tab) => {
    switch (tab) {
      case 'dashboard': return { Icon: LayoutDashboard, label: "Inicio", color: '#E31937', filled: true };
      case 'cola': return { Icon: Truck, label: "Lista", color: '#0072BC', filled: true };
      case 'nuevo': return { Icon: Plus, label: "Nuevo", color: '#10b981', filled: false };
      case 'historial': return { Icon: Clock, label: "Historial", color: '#f97316', filled: false };
      case 'usuarios': return { Icon: Users, label: "Usuarios", color: '#00b4d8', filled: true };
      default: return { Icon: LayoutDashboard, label: "Inicio", color: '#E31937', filled: true };
    }
  };

  let currentPosPct = activeIndex * itemWidthPct;
  if (isDraggingNav && navRef.current) {
    const rect = navRef.current.getBoundingClientRect();
    const relativeX = navTouchX - rect.left;
    const totalWidth = rect.width;
    currentPosPct = (relativeX / totalWidth) * 100 - (itemWidthPct / 2);
    currentPosPct = Math.max(0, Math.min(100 - itemWidthPct, currentPosPct));
  }

  return (
    <nav
      id="main-mobile-nav-v17"
      className={`bottom-nav mobile-only ${isDraggingNav || jumpStretch > 1 ? 'nav-active-scale' : ''}`}
      style={{
        touchAction: 'none',
        position: 'relative',
        overflow: 'visible'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="nav-background-wrapper">
        <div className="nav-base-bar-blur"></div>
      </div>

      <div
        ref={navRef}
        className="nav-content-area"
        style={{ position: 'absolute', inset: '0 6px', pointerEvents: 'none' }}
      >
        <div
          className={`nav-lens-indicator ${!isDraggingNav ? 'lens-idle' : ''}`}
          style={{
            left: `${currentPosPct}%`,
            width: `${itemWidthPct}%`,
            transition: isDraggingNav ? 'none' : 'left 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
          }}
        >
          <div className="nav-lens-liquid-bg" />
          <div className="nav-lens-chromatic" />
          <div className="nav-lens-glint" />
        </div>

        <div className="nav-items-layer">
          {mobileTabs.map((tab, idx) => {
            const { Icon, label } = getTabInfo(tab);
            const iconPosPct = idx * itemWidthPct;
            const distancePct = Math.abs(currentPosPct - iconPosPct);
            const zoomRange = itemWidthPct * 0.9;
            const normalizedDist = distancePct / zoomRange;
            const edgeFactor = Math.sin(normalizedDist * Math.PI) * (distancePct < zoomRange ? 1 : 0);
            const dynamicScale = 1 + (edgeFactor * 0.55);

            return (
              <div
                key={`base-${tab}`}
                className="bottom-nav-item"
                onClick={() => handleTabClick(tab, idx)}
                style={{ pointerEvents: 'auto' }}
              >
                <div
                  className="item-content-wrapper"
                  style={{
                    transform: `scale(${dynamicScale})`,
                    transition: isDraggingNav ? 'none' : 'transform 0.3s ease'
                  }}
                >
                  <Icon size={22} strokeWidth={1.5} />
                  <span>{label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="nav-items-layer active-reveal-layer"
          style={{
            clipPath: `inset(0px ${100 - (currentPosPct + itemWidthPct)}% 0px ${currentPosPct}%)`,
            transition: isDraggingNav ? 'none' : 'clip-path 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          {mobileTabs.map((tab, idx) => {
            const { Icon, label, color, filled } = getTabInfo(tab);
            const iconPosPct = idx * itemWidthPct;
            const distancePct = Math.abs(currentPosPct - iconPosPct);
            const zoomRange = itemWidthPct * 0.9;
            const normalizedDist = distancePct / zoomRange;
            const edgeFactor = Math.sin(normalizedDist * Math.PI) * (distancePct < zoomRange ? 1 : 0);
            const dynamicScale = 1 + (edgeFactor * 0.55);

            return (
              <div key={`active-${tab}`} className="bottom-nav-item">
                <div
                  className="item-content-wrapper"
                  style={{
                    transform: `scale(${dynamicScale})`,
                    color: color,
                    transition: isDraggingNav ? 'none' : 'transform 0.3s ease'
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={filled ? 2 : 2.8}
                    fill={filled ? "currentColor" : "none"}
                  />
                  <span>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileNavigation;
