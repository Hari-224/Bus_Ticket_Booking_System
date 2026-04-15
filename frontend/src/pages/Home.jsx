import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBus, FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaShieldAlt, FaClock, FaHeadset, FaWifi, FaSnowflake, FaChair, FaStar, FaBolt, FaLock, FaCheckCircle } from 'react-icons/fa';
import { routeService } from '../services/busService';
import toast from 'react-hot-toast';

const homeStyles = `
.home-page {
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    --home-primary: #2563eb;
    --home-primary-dark: #1d4ed8;
    --home-secondary: #dbeafe;
    --home-bg-soft: #f8fafc;
    --home-bg-alt: #f1f5f9;
    --home-text: #0f172a;
    --home-muted: #64748b;
    --home-border: #dbe4f1;
    --home-radius: 12px;
    --home-shadow-soft: 0 6px 18px rgba(15, 23, 42, 0.08);
    --home-shadow-hover: 0 14px 28px rgba(15, 23, 42, 0.12);
    --home-transition: all 240ms ease;
}

.home-page section {
    padding: 40px 0;
}

.home-page * {
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.home-page .section-tight {
    padding: 30px 0;
}

.home-page .section-loose {
    padding: 50px 0;
}

.home-page .container {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 0 16px;
}

.home-page {
    font-size: 14px;
    line-height: 1.6;
    overflow-x: hidden;
}

.home-page h1 {
    font-size: 28px;
    line-height: 1.2;
}

.home-page h2,
.section-heading,
.popular-title {
    font-size: 24px;
    line-height: 1.3;
}

.home-page h3 {
    font-size: 18px;
    line-height: 1.3;
}

* {
    min-width: 0;
}

img {
    max-width: 100%;
    height: auto;
}

.hero {
    position: relative;
    --hero-navbar-height: 72px;
    min-height: calc(100vh - var(--hero-navbar-height));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(10px, 1.8vh, 18px) 0 clamp(26px, 4vh, 40px);
    overflow: hidden;

    background:
        radial-gradient(circle at top left, rgba(59, 130, 246, 0.2), transparent 30%),
        radial-gradient(circle at 80% 10%, rgba(14, 165, 233, 0.14), transparent 26%),
        linear-gradient(180deg, #f8fbff 0%, #eef6ff 42%, #f8fafc 100%);
}

.hero-background {
    position: absolute;
    inset: 0;
    z-index: 0;
}

.hero-gradient {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at 20% 18%, rgba(37, 99, 235, 0.14) 0%, transparent 35%),
        radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.12) 0%, transparent 32%),
        radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.9) 0%, transparent 45%);
}

.hero-pattern {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(circle at center, black 35%, transparent 80%);
    opacity: 0.35;
}

.hero-content {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(16px, 2.5vh, 24px);
}

.hero-text {
    text-align: center;
    margin-bottom: 0;
    max-width: 900px;
}

.hero-title {
    font-size: clamp(2.2rem, 3.6vw, 4rem);
    font-weight: 900;
    margin-bottom: 1.25rem;
    letter-spacing: -0.03em;
    line-height: 1.08;
    color: #0f172a;
}

.hero-subtitle {
    font-size: clamp(1rem, 1.35vw, 1.3rem);
    color: #334155;
    max-width: 780px;
    margin: 0 auto;
    line-height: 1.65;
}

.search-form {
    width: 100%;
    max-width: 1024px;
    margin: clamp(8px, 2vh, 16px) auto 0;
    padding: 16px;
    border-radius: var(--home-radius);
    border: 1px solid rgba(203, 213, 225, 0.8);
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(8px);
}

.home-section {
    padding: 0;
}

.home-section-alt {
    background: var(--home-bg-soft);
}

.home-surface-gradient {
    background: var(--home-bg-soft);
}

.popular-intro {
    max-width: 100%;
    margin: 0 auto 1.5rem;
    text-align: center;
    padding: 0 12px;
}

.popular-title {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--home-text);
}

.popular-copy {
    margin-top: 0.5rem;
    color: var(--home-muted);
    line-height: 1.6;
    font-size: 0.9rem;
}

.search-fields {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    align-items: end;
}

.search-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 0;
}

.home-page .form-label {
    margin-bottom: 0;
}

.home-page .form-input,
.home-page .form-select,
.home-page input[type="date"] {
    width: 100%;
    height: 48px;
    border-radius: var(--home-radius);
    border: 1px solid #cbd5e1;
    padding: 0 12px;
    background: #ffffff;
    font-size: 14px;
    transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease, background-color 200ms ease;
}

.home-page .form-input:hover,
.home-page .form-select:hover,
.home-page input[type="date"]:hover {
    background: #f8fbff;
}

.home-page .form-input:focus,
.home-page .form-select:focus,
.home-page input[type="date"]:focus {
    border-color: var(--home-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    outline: none;
}

.label-icon {
    margin-right: 0.4rem;
    color: var(--home-primary);
    font-size: 1rem;
}

.swap-icon-container {
    display: none;
    align-items: center;
    padding-bottom: 0.3rem;
}

.swap-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 246, 255, 0.92));
    border: 1px solid rgba(191, 219, 254, 0.9);
    border-radius: 9999px;
    color: var(--accent-primary);
    font-size: 1rem;
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12);
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.swap-icon:hover {
    transform: translateY(-2px) rotate(90deg);
    box-shadow: 0 14px 34px rgba(37, 99, 235, 0.16);
}

.search-btn {
    width: 100%;
    height: 48px;
    border-radius: var(--home-radius);
    min-height: 48px;
    font-size: 14px;
}

.card {
    border: 1px solid var(--home-border);
    border-radius: var(--home-radius);
    background: #ffffff;
    box-shadow: 0 5px 16px rgba(15, 23, 42, 0.08);
    transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
    border-color: #cbd5e1;
}

.card-route {
    min-height: 232px;
    justify-content: space-between;
}

.route-card-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
}

.route-action {
    margin-top: 1rem;
}

.features-section {
    background: #ffffff;
}

.section-title {
    font-size: 32px;
    margin-bottom: 2rem;
    text-align: center;
    font-weight: 800;
    letter-spacing: -0.03em;
}

.features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    align-items: stretch;
}

.feature-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: 100%;
    gap: 8px;
    padding: 16px 12px;
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
}

.feature-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border-radius: 1.25rem;
    font-size: 1.4rem;
    color: white;
    box-shadow: 0 14px 30px rgba(37, 99, 235, 0.2);
}

.feature-card h3 {
    margin-bottom: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--home-text);
}

.feature-card p {
    flex: 1;
    font-size: 0.9rem;
    color: var(--home-muted);
    line-height: 1.6;
}

.amenities-section {
    background: var(--home-bg-soft);
}

.amenities-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.amenity-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 120px;
    padding: 16px;
    gap: 8px;
    transition: all 0.3s ease;
}

.amenity-item:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 25px rgba(37, 99, 235, 0.08);
}

.amenity-item:hover .amenity-icon {
    background: rgba(37, 99, 235, 0.14);
    color: var(--home-primary-dark);
    transform: scale(1.07);
}

.amenity-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(191, 219, 254, 0.9);
    border-radius: 1.25rem;
    font-size: 1.2rem;
    color: var(--accent-primary);
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
    transition: var(--home-transition);
}

.amenity-item span {
    font-size: 0.85rem;
    color: var(--home-text);
    font-weight: 600;
}

.stats-section {
    background: #ffffff;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    text-align: center;
}

.routes-grid,
.choice-grid,
.testimonials-grid,
.offers-grid {
    align-items: stretch;
}

.routes-grid > *,
.choice-grid > *,
.testimonials-grid > *,
.offers-grid > * {
    height: 100%;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 16px;
    text-align: center;
    height: 100%;
    transition: all 0.3s ease;
}

.stat-item:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08);
}

.stat-value {
    font-size: 1.1rem;
    font-weight: 800;
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.footer {
    padding: 3rem 0;
    border-top: 1px solid rgba(226, 232, 240, 0.8);
    margin-top: 2rem;
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(16px);
}

.section-shell {
    padding: 0;
}

.section-panel {
    border: 1px solid rgba(226, 232, 240, 0.82);
    border-radius: 2rem;
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
    backdrop-filter: blur(18px);
}

.section-kicker {
    margin-bottom: 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: #475569;
}

.section-copy {
    max-width: 42rem;
    margin: 0 auto;
    color: var(--home-muted);
    line-height: 1.7;
    font-size: 1rem;
    text-align: center;
}

.section-header {
    text-align: center;
    margin-bottom: 40px;
}

.section-header.center {
    text-align: center;
    margin-bottom: 40px;
}

.section-tag {
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #64748b;
}

.section-subtitle {
    text-align: center;
    max-width: 700px;
    margin: 0 auto;
    color: #6b7280;
    line-height: 1.6;
    font-size: 1rem;
}

.amenities-section .section-subtitle {
    text-align: center;
    max-width: 720px;
    margin: 10px auto 0;
}

.feature-badges {
    display: flex;
    justify-content: center;
    gap: 12px 14px;
    flex-wrap: wrap;
    margin-top: 24px;
    margin-bottom: 4px;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
    font-size: 13px;
    font-weight: 500;
    border: 1px solid rgba(37, 99, 235, 0.16);
}

.badge:hover {
    background: #2563eb;
    color: #ffffff;
    transform: translateY(-2px);
}

.offers-shell {
    border: 1px solid #dbeafe;
    border-radius: 20px;
    padding: 32px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    box-shadow: var(--home-shadow-soft);
}

.offers-section .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.offers-section .content-wrapper {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
}

.offers-cards {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    margin-top: 16px;
}

.offers-cards .card {
    flex: 1 1 280px;
    max-width: 360px;
}

.home-page button,
.home-page a {
    transition: var(--home-transition);
}

.home-page button:focus-visible,
.home-page a:focus-visible {
    outline: 2px solid rgba(37, 99, 235, 0.35);
    outline-offset: 2px;
}

.card-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

/* Utility Classes */
.text-center {
    text-align: center;
}

.text-left {
    text-align: left;
}

.flex {
    display: flex;
}

.flex-col {
    flex-direction: column;
}

.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
}

.mx-auto {
    margin-left: auto;
    margin-right: auto;
}

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }

.fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease;
}

.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}

.hero-fade-in {
    animation: fadeUp 700ms ease both;
}

.hero-fade-in-delay {
    animation: fadeUp 700ms ease both;
    animation-delay: 120ms;
}

.section-fade-in {
    animation: fadeUp 700ms ease both;
}

.section-fade-in-delay-1 {
    animation: fadeUp 700ms ease both;
    animation-delay: 80ms;
}

.section-fade-in-delay-2 {
    animation: fadeUp 700ms ease both;
    animation-delay: 160ms;
}

.section-fade-in-delay-3 {
    animation: fadeUp 700ms ease both;
    animation-delay: 240ms;
}

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(18px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Tablet: 576px+ */
@media (min-width: 576px) {
    .home-page .container {
        padding: 0 20px;
    }

    .home-page h1 {
        font-size: 32px;
    }

    .home-page h2,
    .section-heading,
    .popular-title {
        font-size: 28px;
    }

    .home-page h3 {
        font-size: 20px;
    }

    .search-form {
        padding: 18px;
    }

    .popular-title {
        font-size: 24px;
    }

    .hero-title {
        font-size: 36px;
    }

    .hero-subtitle {
        font-size: 1rem;
        max-width: 650px;
    }
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
    .home-page section {
        padding: 60px 0;
    }

    .home-page .section-loose {
        padding: 70px 0;
    }

    .home-page .container {
        max-width: 720px;
    }

    .home-page h1 {
        font-size: 36px;
    }

    .home-page h2,
    .section-heading,
    .popular-title {
        font-size: 32px;
    }

    .home-page h3 {
        font-size: 22px;
    }

    .home-page {
        font-size: 15px;
    }

    .hero {
        --hero-navbar-height: 76px;
        min-height: calc(100vh - var(--hero-navbar-height));
        padding: clamp(12px, 2vh, 22px) 0 clamp(30px, 4.4vh, 46px);
    }

    .hero-title {
        font-size: clamp(2.6rem, 4.4vw, 4rem);
    }

    .hero-subtitle {
        font-size: clamp(1.05rem, 1.5vw, 1.25rem);
        max-width: 700px;
    }

    .search-form {
        max-width: 900px;
        padding: 20px;
    }

    .search-fields {
        grid-template-columns: repeat(3, 1fr) auto;
        gap: 14px;
    }

    .search-btn {
        width: auto;
        min-width: 180px;
        height: 48px;
    }

    .features-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 18px;
    }

    .amenities-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 18px;
    }

    .feature-card {
        padding: 18px;
    }

    .feature-icon {
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
        margin-bottom: 0.9rem;
    }

    .feature-card h3 {
        font-size: 1.2rem;
    }

    .feature-card p {
        font-size: 0.95rem;
    }

    .amenity-item {
        min-height: 140px;
        padding: 18px;
    }

    .amenity-icon {
        width: 52px;
        height: 52px;
        font-size: 1.3rem;
    }

    .amenity-item span {
        font-size: 0.9rem;
    }

    .stat-item {
        padding: 18px;
    }

    .stat-value {
        font-size: 1.3rem;
    }

    .popular-title {
        font-size: 28px;
    }

    .popular-copy {
        font-size: 0.95rem;
    }

    .swap-icon-container {
        display: flex;
    }
}

/* Laptop: 992px+ */
@media (min-width: 992px) {
    .home-page section {
        padding: 70px 0;
    }

    .home-page .section-loose {
        padding: 80px 0;
    }

    .home-page .container {
        max-width: 960px;
    }

    .home-page h1 {
        font-size: 40px;
    }

    .home-page h2,
    .section-heading,
    .popular-title {
        font-size: 36px;
    }

    .home-page h3 {
        font-size: 24px;
    }

    .home-page {
        font-size: 16px;
    }

    .hero {
        --hero-navbar-height: 82px;
        min-height: calc(100vh - var(--hero-navbar-height));
        padding: clamp(14px, 2.2vh, 24px) 0 clamp(32px, 4.8vh, 52px);
    }

    .hero-title {
        font-size: clamp(3rem, 4.6vw, 4.35rem);
    }

    .hero-subtitle {
        font-size: clamp(1.1rem, 1.2vw, 1.3rem);
        max-width: 700px;
    }

    .search-form {
        max-width: 1000px;
        padding: 24px;
    }

    .search-fields {
        grid-template-columns: 1fr auto 1fr 1fr auto;
        gap: 16px;
    }

    .search-btn {
        min-width: 200px;
        height: 56px;
    }

    .form-input,
    .form-select,
    input[type="date"] {
        height: 56px;
        padding: 0 16px;
        font-size: 15px;
    }

    .features-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }

    .amenities-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
    }

    .stats-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
    }

    .feature-card {
        padding: 24px;
    }

    .feature-icon {
        width: 66px;
        height: 66px;
        font-size: 1.6rem;
        margin-bottom: 1rem;
    }

    .feature-card h3 {
        font-size: 1.5rem;
    }

    .feature-card p {
        font-size: 1rem;
    }

    .amenity-item {
        min-height: 156px;
        padding: 24px;
    }

    .amenity-icon {
        width: 56px;
        height: 56px;
        font-size: 1.4rem;
    }

    .amenity-item span {
        font-size: 1rem;
    }

    .stat-item {
        padding: 1.25rem;
    }

    .stat-value {
        font-size: 1.5rem;
    }

    .popular-title {
        font-size: 32px;
    }

    .popular-copy {
        font-size: 1rem;
    }

    .popular-intro {
        max-width: 56rem;
        margin: 0 auto 2rem;
        padding: 0;
    }
}

/* Desktop: 1200px+ */
@media (min-width: 1200px) {
    .home-page .container {
        max-width: 1140px;
    }

    .home-page h1 {
        font-size: 48px;
    }

    .home-page h2,
    .section-heading,
    .popular-title {
        font-size: 38px;
    }

    .hero-title {
        font-size: clamp(3.2rem, 4.8vw, 4.6rem);
    }

    .hero-subtitle {
        font-size: 1.125rem;
    }

    .search-form {
        max-width: 1000px;
    }
}

/* Extra Large: 1400px+ */
@media (min-width: 1400px) {
    .home-page .container {
        max-width: 1320px;
    }
}
`;

const SectionHeader = ({ kicker, title, description, align = 'center' }) => (
    <div className={`section-header mb-8 ${align === 'center' ? 'text-center' : 'text-left'}`}>
        <p className="section-kicker">{kicker}</p>
        <h2 className="section-heading font-bold tracking-tight text-slate-900">{title}</h2>
        {description ? <p className={`section-copy ${align === 'center' ? 'mx-auto mt-3' : 'mt-3'}`}>{description}</p> : null}
    </div>
);

const TrustBadge = ({ icon, label }) => (
    <div className="badge">
        <span className="text-blue-600">{icon}</span>
        <span>{label}</span>
    </div>
);

const Home = () => {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState({ sources: [], destinations: [] });
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchAttempted, setSearchAttempted] = useState(false);

    useEffect(() => {
        fetchRoutes();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
    }, []);

    useEffect(() => {
        const elements = document.querySelectorAll('.fade-in');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.2 }
        );

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await routeService.getAllRoutes();
            if (response?.success && response?.data) {
                setRoutes({
                    sources: Array.isArray(response.data.sources) ? response.data.sources : [],
                    destinations: Array.isArray(response.data.destinations) ? response.data.destinations : [],
                });
            }
        } catch (error) {
            console.error('Failed to fetch routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchAttempted(true);

        if (!source || !destination || !date) {
            toast.error('Please fill in all fields');
            return;
        }

        if (source === destination) {
            toast.error('Source and destination cannot be the same');
            return;
        }

        toast.success('Finding the best buses for you');
        navigate(`/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${date}`);
    };

    const handleQuickRoute = (route) => {
        setSource(route.source);
        setDestination(route.destination);
        setDate(new Date().toISOString().split('T')[0]);
        setSearchAttempted(false);
        toast.success(`${route.source} to ${route.destination} loaded`);
    };

    const getMinDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 6);
        return maxDate.toISOString().split('T')[0];
    };

    const features = [
        { icon: <FaShieldAlt />, title: 'Safe & Secure', description: 'Your transactions are protected with bank-grade security.' },
        { icon: <FaClock />, title: 'Instant Booking', description: 'Get your tickets confirmed in seconds with a frictionless flow.' },
        { icon: <FaHeadset />, title: '24/7 Support', description: 'Our support team is always here to help when plans change.' },
    ];

    const amenities = [
        { icon: <FaWifi />, name: 'Free WiFi' },
        { icon: <FaSnowflake />, name: 'AC Buses' },
        { icon: <FaChair />, name: 'Comfortable Seats' },
        { icon: <FaBus />, name: 'GPS Tracking' },
    ];

    const trustStats = [
        { label: 'Live seat availability', icon: <FaBolt /> },
        { label: 'Instant booking confirmation', icon: <FaCheckCircle /> },
        { label: 'Secure payment', icon: <FaLock /> },
        { label: 'Real-time updates', icon: <FaClock /> },
    ];

    const popularRoutes = [
        { source: 'Bengaluru', destination: 'Chennai', duration: '6h 45m', price: 'From ₹799', tag: 'Night Saver' },
        { source: 'Hyderabad', destination: 'Pune', duration: '8h 10m', price: 'From ₹899', tag: 'Volvo AC' },
        { source: 'Mumbai', destination: 'Goa', duration: '10h 00m', price: 'From ₹1,099', tag: 'Beach Express' },
        { source: 'Delhi', destination: 'Jaipur', duration: '5h 15m', price: 'From ₹699', tag: 'Fast Route' },
    ];

    const offers = [
        { title: 'Weekend Saver', code: 'BUSWEEKEND', text: 'Save up to 20% on selected routes this weekend.' },
        { title: 'First Ride Offer', code: 'FIRSTBUS', text: 'New users get instant discounts on their first booking.' },
    ];

    const whyChooseUs = [
        { icon: <FaShieldAlt />, title: 'Verified operators', text: 'Book only from trusted travel partners with clear trip details.' },
        { icon: <FaClock />, title: 'Fast booking', text: 'Find buses, compare options, and reserve seats in a few clicks.' },
        { icon: <FaHeadset />, title: '24/7 support', text: 'Human support when plans change, with prompt booking assistance.' },
        { icon: <FaBus />, title: 'Comfort first', text: 'Choose AC, sleeper, and premium buses with seat transparency.' },
    ];

    const testimonials = [
        { name: 'Ananya R.', role: 'Frequent traveler', quote: 'Search is clear, seat options update quickly, and checkout feels safe.', rating: 5 },
        { name: 'Rahul S.', role: 'Weekend commuter', quote: 'I can book in a couple of minutes and ticket confirmation is instant.', rating: 4 },
        { name: 'Meera P.', role: 'Business traveler', quote: 'Simple layout, accurate route details, and a smooth booking experience.', rating: 4 },
    ];

    const footerLinks = [
        { label: 'Search Buses', to: '/search' },
        { label: 'My Trips', to: '/my-trips' },
        { label: 'View Ticket', to: '/view-ticket' },
        { label: 'Cancel Ticket', to: '/cancellation' },
    ];

    const supportLinks = [
        { label: 'Help Center', href: '#' },
        { label: 'FAQs', href: '#' },
        { label: 'Terms & Conditions', href: '#' },
        { label: 'Privacy Policy', href: '#' },
    ];

    return (
        <div className="home-page">
            <style>{homeStyles}</style>
            <section className="hero flex items-center justify-center">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                    <div className="hero-pattern"></div>
                </div>

                <div className="hero-content container flex w-full flex-col items-center justify-center">
                    <div className="hero-text hero-fade-in mx-auto text-center">
                        <h1 className="hero-title">
                            Travel Made <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">Simple</span>
                        </h1>
                        <p className="hero-subtitle">
                            Book bus tickets instantly. Discover comfortable journeys across popular routes with trusted operators.
                        </p>
                        <div className="feature-badges flex flex-wrap items-center justify-center">
                            {trustStats.map((item) => (
                                <TrustBadge
                                    key={item.label}
                                    icon={item.icon}
                                    label={item.label}
                                />
                            ))}
                        </div>
                    </div>

                    <form className="search-form hero-fade-in-delay w-full" onSubmit={handleSearch}>
                        <div className="search-fields">
                            <div className="form-group search-field">
                                <label className="form-label">
                                    <FaMapMarkerAlt className="label-icon" />
                                    From
                                </label>
                                <select
                                    className={`form-input form-select transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${searchAttempted && !source ? 'border-red-300 ring-2 ring-red-100' : ''}`}
                                    value={source}
                                    onChange={(e) => setSource(e.target.value)}
                                    disabled={loading}
                                    aria-invalid={searchAttempted && !source}
                                >
                                    <option value="">Select Source</option>
                                    {(routes.sources ?? []).map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="swap-icon-container">
                                <div className="swap-icon">⇄</div>
                            </div>

                            <div className="form-group search-field">
                                <label className="form-label">
                                    <FaMapMarkerAlt className="label-icon" />
                                    To
                                </label>
                                <select
                                    className={`form-input form-select transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${searchAttempted && !destination ? 'border-red-300 ring-2 ring-red-100' : ''}`}
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    disabled={loading}
                                    aria-invalid={searchAttempted && !destination}
                                >
                                    <option value="">Select Destination</option>
                                    {(routes.destinations ?? []).filter((city) => city !== source).map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group search-field">
                                <label className="form-label">
                                    <FaCalendarAlt className="label-icon" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    className={`form-input transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${searchAttempted && !date ? 'border-red-300 ring-2 ring-red-100' : ''}`}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                    aria-invalid={searchAttempted && !date}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg search-btn">
                                <FaSearch />
                                <span>Search Buses</span>
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <section className="features-section section-shell fade-in">
                <div className="container">
                    <SectionHeader kicker="Why choose us" title={<><span className="text-slate-900">Built for trust and</span> <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">convenience</span></>} description="A booking experience that feels calm, fast, and reliable from the first search to the final confirmation." />
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className={`feature-card card card-center section-fade-in-delay-${index + 1}`}>
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-slate-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="amenities-section fade-in">
                <div className="container">
                    <SectionHeader kicker="Amenities" title={<><span className="text-slate-900">Premium</span> <span className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">Amenities</span></>} description="Comfort-focused features that make the ride feel polished before you even board." />
                    <div className="amenities-grid">
                        {amenities.map((amenity, index) => (
                            <div key={index} className={`amenity-item card card-center section-fade-in-delay-${index + 1}`}>
                                <div className="amenity-icon">{amenity.icon}</div>
                                <span>{amenity.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="stats-section section-shell fade-in">
                <div className="container">
                <div className="section-header center">
                    <p className="section-tag">Feature Highlights</p>
                    <h2 className="section-heading font-bold tracking-tight text-slate-900">Fast, Reliable &amp; Secure Booking</h2>
                    <p className="section-subtitle">Everything you need for a smooth and stress-free journey experience.</p>
                </div>
                <div className="stats-grid">
                    <div className="stat-item card section-fade-in-delay-1">
                        <span className="stat-title">Live</span>
                        <span className="stat-subtitle">Seat availability</span>
                    </div>
                    <div className="stat-item card section-fade-in-delay-2">
                        <span className="stat-title">Real-time</span>
                        <span className="stat-subtitle">Booking updates</span>
                    </div>
                    <div className="stat-item card section-fade-in-delay-3">
                        <span className="stat-title">Secure</span>
                        <span className="stat-subtitle">Checkout flow</span>
                    </div>
                    <div className="stat-item card section-fade-in-delay-3">
                        <span className="stat-title">Instant</span>
                        <span className="stat-subtitle">Ticket confirmation</span>
                    </div>
                </div>
                </div>
            </section>

            <section className="home-section home-section-alt home-surface-gradient">
                <div className="container">
                    <div className="popular-intro">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Popular routes</p>
                        <h2 className="popular-title">Frequently booked journeys</h2>
                        <p className="popular-copy">Quickly jump into common routes to compare timings, fares, and seat availability.</p>
                    </div>

                    {loading ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
                                    <div className="mb-4 h-4 w-24 rounded-full bg-slate-200"></div>
                                    <div className="mb-2 h-7 w-40 rounded bg-slate-200"></div>
                                    <div className="mb-6 h-4 w-32 rounded bg-slate-200"></div>
                                    <div className="h-12 rounded-xl bg-slate-200"></div>
                                </div>
                            ))}
                        </div>
                    ) : popularRoutes.length > 0 ? (
                        <div className="routes-grid grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 xl:gap-6">
                            {popularRoutes.map((route, index) => (
                                <div key={`${route.source}-${route.destination}`} className={`route-card card card-route group flex h-full flex-col items-center p-6 text-center section-fade-in-delay-${(index % 3) + 1}`}>
                                    <div className="mb-4 inline-flex w-fit rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">{route.tag}</div>
                                    <div className="route-card-body w-full">
                                        <div className="min-w-0 text-center">
                                            <p className="text-lg font-bold leading-7 tracking-tight text-slate-900">{route.source} → {route.destination}</p>
                                            <p className="mt-1 text-sm text-slate-500">{route.duration}</p>
                                        </div>
                                        <div className="shrink-0 text-center">
                                            <p className="text-sm font-semibold text-slate-500">Fare</p>
                                            <p className="text-lg font-bold text-blue-600">{route.price}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="route-action btn btn-primary w-full px-4 py-3 text-sm font-semibold"
                                        onClick={() => handleQuickRoute(route)}
                                    >
                                        Use this route
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                            No popular routes are available right now. Try searching directly with your travel details.
                        </div>
                    )}
                </div>
            </section>

            <section className="home-section offers-section">
                <div className="container">
                    <div className="offers-shell content-wrapper md:px-8">
                        <div className="flex flex-col items-center gap-6">
                            <div>
                                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Offers & discounts</p>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Save more on every booking</h2>
                                <p className="mt-2 max-w-2xl text-sm text-slate-600">Simple, transparent offers that reward repeat travel without cluttering the booking experience.</p>
                            </div>
                            <div className="offers-cards w-full">
                                {offers.map((offer) => (
                                    <div key={offer.code} className="card card-center h-full p-5">
                                        <p className="text-sm font-semibold text-slate-900">{offer.title}</p>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">{offer.text}</p>
                                        <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">Code: {offer.code}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="home-section home-section-alt">
                <div className="container">
                    <SectionHeader kicker="Why choose us" title="Built for trust and convenience" description="A cleaner interface that puts confidence, clarity, and speed at the center of the booking flow." />

                    <div className="choice-grid grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {whyChooseUs.map((item, index) => (
                            <div key={item.title} className={`card card-center flex h-full flex-col p-6 section-fade-in-delay-${(index % 3) + 1}`}>
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-xl text-blue-600 ring-1 ring-blue-100">{item.icon}</div>
                                <h3 className="font-semibold tracking-tight text-slate-900">{item.title}</h3>
                                <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="home-section">
                <div className="container">
                    <SectionHeader kicker="Testimonials" title="What travelers say" description="A polished booking flow that feels fast, clear, and dependable from search to confirmation." />

                    <div className="testimonials-grid grid gap-5 lg:grid-cols-3">
                        {testimonials.map((item, index) => (
                            <div key={item.name} className={`card card-center flex h-full flex-col p-6 section-fade-in-delay-${(index % 3) + 1}`}>
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold tracking-tight text-slate-900">{item.name}</p>
                                        <p className="text-sm text-slate-500">{item.role}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {Array.from({ length: 5 }).map((_, starIndex) => (
                                            <FaStar key={starIndex} className={starIndex < item.rating ? 'text-amber-500' : 'text-amber-200'} />
                                        ))}
                                    </div>
                                </div>
                                <p className="flex-1 text-sm leading-7 text-slate-600">“{item.quote}”</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};
export default Home;

