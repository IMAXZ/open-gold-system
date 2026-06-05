<template>
  <div class="app-shell">
    <div class="ambient ambient--one"></div>
    <div class="ambient ambient--two"></div>

    <header class="hero">
      <div class="hero-main">
        <div class="brand-mark">
          <img src="./assets/logo.svg" alt="黄金价格仪表盘" class="hero-logo" />
        </div>
        <div class="hero-copy">
          <p class="hero-kicker">Gold Market View</p>
          <h1>黄金价格看板</h1>
          <p>更紧凑地查看价格、涨跌幅与区间统计。</p>
        </div>
      </div>

      <div class="hero-badges">
        <span class="hero-badge">实时筛选</span>
        <span class="hero-badge">人民币 / 美元</span>
        <span class="hero-badge">区间统计</span>
      </div>
    </header>

    <GoldChart />
  </div>
</template>

<script>
import GoldChart from './components/GoldChart.vue'

export default {
  name: 'App',
  components: {
    GoldChart
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background:
    radial-gradient(circle at 15% 20%, rgba(255,185,0,0.16), transparent 20%),
    radial-gradient(circle at 85% 18%, rgba(255,92,92,0.12), transparent 22%),
    linear-gradient(180deg, #07111f 0%, #0b1527 45%, #07111f 100%);
  color: #fff7e6;
  transition: background 0.25s ease, color 0.25s ease;
}

body.gold-dashboard-light {
  background:
    radial-gradient(circle at 15% 20%, rgba(255,196,80,0.12), transparent 20%),
    radial-gradient(circle at 85% 18%, rgba(255,131,92,0.1), transparent 22%),
    linear-gradient(180deg, #fffaf1 0%, #f6eedf 45%, #fffdf8 100%);
  color: #36250a;
}

body.gold-dashboard-dark {
  background:
    radial-gradient(circle at 15% 20%, rgba(255,185,0,0.16), transparent 20%),
    radial-gradient(circle at 85% 18%, rgba(255,92,92,0.12), transparent 22%),
    linear-gradient(180deg, #07111f 0%, #0b1527 45%, #07111f 100%);
  color: #fff7e6;
}

.app-shell {
  position: relative;
  overflow: hidden;
  padding: 18px 20px 32px;
}

.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  pointer-events: none;
  opacity: 0.6;
  transition: background 0.25s ease;
}

.ambient--one {
  top: -40px;
  right: -60px;
  width: 260px;
  height: 260px;
  background: rgba(255,171,0,0.18);
}

.ambient--two {
  left: -90px;
  top: 200px;
  width: 300px;
  height: 300px;
  background: rgba(69,208,227,0.12);
}

body.gold-dashboard-light .ambient--one {
  background: rgba(255,185,0,0.14);
}

body.gold-dashboard-light .ambient--two {
  background: rgba(255,122,89,0.12);
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1280px;
  margin: 0 auto 14px;
  padding: 14px 18px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(14px);
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.brand-mark {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(14px);
  transition: background 0.25s ease, border-color 0.25s ease;
}

body.gold-dashboard-light .brand-mark {
  background: rgba(255,255,255,0.72);
  border-color: rgba(170,130,40,0.18);
}

.hero-logo {
  width: 32px;
  height: 32px;
}

.hero-copy h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.08;
  white-space: nowrap;
}

.hero-copy p {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(255,245,225,0.72);
  transition: color 0.25s ease;
}

body.gold-dashboard-light .hero-copy p {
  color: rgba(54,37,10,0.82);
}

.hero-kicker {
  margin: 0 0 4px;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255,219,136,0.72);
}

body.gold-dashboard-light .hero-kicker {
  color: rgba(98,67,10,0.8);
}

.hero-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.06);
  color: rgba(255,245,225,0.84);
  font-size: 12px;
}

body.gold-dashboard-light .hero-badge {
  background: rgba(255,255,255,0.82);
  border-color: rgba(170,130,40,0.16);
  color: rgba(54,37,10,0.84);
}

@media (max-width: 768px) {
  .hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-copy h1 {
    font-size: 22px;
    white-space: normal;
  }

  .hero-badges {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .app-shell {
    padding: 12px 12px 24px;
  }

  .hero {
    padding: 12px 14px;
  }

  .hero-main {
    align-items: flex-start;
  }

  .brand-mark {
    width: 52px;
    height: 52px;
  }

  .hero-copy h1 {
    font-size: 20px;
  }
}
</style>
