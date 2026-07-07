"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  Layers,
  BarChart3,
  Search,
  CreditCard,
  Smartphone,
  Check,
  Menu,
  X
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["fitur", "keunggulan", "harga", "tentang"];
      const scrollPosition = window.scrollY + 200;
      
      let current = "";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            current = section;
          }
        }
      }
      
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        current = "tentang";
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface font-sans">
      {/* TopNavBar */}
      <nav className="bg-surface/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-md md:px-margin-desktop py-md max-w-7xl mx-auto">
          <div className="text-xl font-extrabold tracking-tight text-primary flex items-center gap-xs">
            <span className="w-8 h-8 rounded-md signature-gradient flex items-center justify-center text-white text-sm font-black">
              A
            </span>
            <span>ABG Konveksi</span>
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-lg">
            <a className={`font-semibold transition-all duration-300 py-1 ${activeSection === "fitur" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`} href="#fitur">
              Fitur
            </a>
            <a className={`font-semibold transition-all duration-300 py-1 ${activeSection === "keunggulan" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`} href="#keunggulan">
              Keunggulan
            </a>
            <a className={`font-semibold transition-all duration-300 py-1 ${activeSection === "harga" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`} href="#harga">
              Harga
            </a>
            <a className={`font-semibold transition-all duration-300 py-1 ${activeSection === "tentang" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"}`} href="#tentang">
              Tentang Kami
            </a>
          </div>

          <div className="hidden md:flex items-center gap-md">
            <Link href="/pages/login" className="text-on-surface-variant font-medium hover:text-primary transition-all">
              Masuk
            </Link>
            <Link href="/apk/abg-konveksi.apk" className="px-lg py-sm signature-gradient text-white rounded-full font-bold scale-105 transition-transform hover:opacity-90 shadow-md flex items-center gap-xs">
              <Smartphone size={18} />
              Download Aplikasi
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-on-surface hover:text-primary p-xs"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-surface-container-lowest border-b border-outline-variant/30 p-lg space-y-md shadow-xl">
            <a 
              className={`block font-semibold ${activeSection === "fitur" ? "text-primary" : "text-on-surface hover:text-primary"}`} 
              href="#fitur" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Fitur
            </a>
            <a 
              className={`block font-semibold ${activeSection === "keunggulan" ? "text-primary" : "text-on-surface hover:text-primary"}`} 
              href="#keunggulan" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Keunggulan
            </a>
            <a 
              className={`block font-semibold ${activeSection === "harga" ? "text-primary" : "text-on-surface hover:text-primary"}`} 
              href="#harga" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Harga
            </a>
            <a 
              className={`block font-semibold ${activeSection === "tentang" ? "text-primary" : "text-on-surface hover:text-primary"}`} 
              href="#tentang" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Tentang Kami
            </a>
            <div className="pt-md border-t border-outline-variant/30 flex flex-col gap-md">
              <Link href="/login" className="w-full text-on-surface-variant font-medium py-2 hover:text-primary transition-all text-center block" onClick={() => setMobileMenuOpen(false)}>
                Masuk
              </Link>
              <Link href="/apk/abg-konveksi.apk" className="w-full px-lg py-sm signature-gradient text-white rounded-full font-bold text-center flex items-center justify-center gap-xs" onClick={() => setMobileMenuOpen(false)}>
                <Smartphone size={18} />
                Download Aplikasi
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-xl pb-xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-md md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
          <div className="space-y-lg">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-on-surface leading-[1.1]">
              Kelola Produksi Konveksi <span className="text-transparent bg-clip-text signature-gradient">Lebih Mudah</span> & Cepat
            </h1>
            <p className="text-lg sm:text-xl text-on-surface-variant max-w-[32rem] leading-relaxed">
              Pantau antrean jahit, status potong, pembayaran DP, hingga pengiriman barang dalam satu platform cloud terintegrasi khusus untuk bisnis konveksi.
            </p>
            <div className="flex flex-wrap gap-md pt-md">
              <Link href="/login" className="inline-flex justify-center items-center px-lg py-md signature-gradient text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg hover:shadow-primary/20">
                Mulai Sekarang
              </Link>
              <Link href="/apk/abg-konveksi.apk" className="inline-flex justify-center items-center px-lg py-md border-2 border-outline-variant text-on-surface rounded-full font-bold text-lg hover:bg-surface-container-low transition-all gap-xs">
                <Smartphone size={20} />
                Download Aplikasi Mobile
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 ambient-shadow rounded-xl overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-700 border border-outline-variant/30 bg-surface-container-lowest">
              <img 
                className="w-full h-auto object-cover" 
                alt="Modern convection and garment management dashboard with analytics and order queues" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAF7uLtmNhy8kyv5U85K1sGZeomJ530f6sgke21nOs_lkyEvWHYS6cnB9PgIKnbXKekNCnbcetm8MelvU-OLEvhpjLUd4WWlvDy6W1sS0htl_BrVwKc3irzUK9Yl68Uk5Qn7KUelAGcPsal08-LjJry77xS7X0ZmA_inQ9TbRfX838Wl_tdCX0OQ3Mr9-rrO6NsiPkftHJ52t6Aa4lJUVr71pCmvpCG2HmGLFZxnvQAKJgE1WQacqESrHPynnWS8fWnCETfvFS0L9U"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-md -left-md z-20 bg-surface-container-lowest p-lg rounded-xl shadow-2xl flex items-center gap-md animate-bounce-slow border border-outline-variant">
              <div className="w-12 h-12 bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant rounded-full flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Produksi Hari Ini</p>
                <p className="text-xl font-extrabold text-on-surface">+84 Pcs Kemeja</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-xl bg-surface-container-low border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-md md:px-margin-desktop">
          <p className="text-center text-sm font-bold text-outline uppercase tracking-[0.2em] mb-lg">
            Dipercaya Oleh 50+ Brand Konveksi & Garment di Seluruh Indonesia
          </p>
          <div className="flex flex-wrap justify-center items-center gap-md md:gap-xl opacity-60">
            <div className="font-extrabold text-outline text-lg tracking-wider">CONVEXA.CO</div>
            <div className="font-extrabold text-outline text-lg tracking-wider">GARMENTINDO</div>
            <div className="font-extrabold text-outline text-lg tracking-wider">APAREL GROUP</div>
            <div className="font-extrabold text-outline text-lg tracking-wider">TAILORSMITH</div>
            <div className="font-extrabold text-outline text-lg tracking-wider">STYLEWERK</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-xl px-md md:px-margin-desktop">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-xl space-y-md">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface">
              Fitur Cerdas untuk Efisiensi Bisnis Konveksi
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
              Semua yang Anda butuhkan untuk mendigitalisasi lantai produksi tanpa kerumitan teknis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {/* Cards */}
            <div className="p-xl rounded-xl bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-lowest hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <Layers size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-md">Manajemen Antrean</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Pantau alur kerja dari cutting, bordir, sewing, QC, hingga packing secara real-time dan bebas antrean menumpuk.
              </p>
            </div>

            <div className="p-xl rounded-xl bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-lowest hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-md bg-secondary/10 text-secondary flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-md">Laporan Omzet & HPP</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Kalkulasi otomatis Harga Pokok Produksi (HPP), omzet penjualan, dan profit margin per pesanan secara akurat.
              </p>
            </div>

            <div className="p-xl rounded-xl bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-lowest hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <Search size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-md">Pelacakan Klien (Live)</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Klien dapat melacak status jahit pesanan mereka secara mandiri menggunakan tautan pelacakan khusus tanpa perlu chat WhatsApp.
              </p>
            </div>

            {/* Dark Wide Card */}
            <div className="md:col-span-2 p-xl rounded-xl bg-inverse-surface text-inverse-on-surface relative overflow-hidden group border border-outline/30">
              <div className="relative z-10 max-w-[28rem]">
                <div className="w-14 h-14 rounded-md bg-inverse-on-surface/10 backdrop-blur flex items-center justify-center mb-lg">
                  <CreditCard size={28} className="text-inverse-on-surface" />
                </div>
                <h3 className="text-3xl font-bold mb-md">Multi Pembayaran & DP</h3>
                <p className="text-inverse-on-surface/80 text-lg leading-relaxed">
                  Kelola pembayaran uang muka (DP), pelunasan bertahap, dan integrasi transfer bank otomatis dengan kuitansi digital instan.
                </p>
              </div>
              <div className="absolute right-[-5%] bottom-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <CreditCard size={240} className="text-inverse-on-surface" />
              </div>
            </div>

            <div className="p-xl rounded-xl bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container-lowest hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-md bg-secondary/10 text-secondary flex items-center justify-center mb-lg group-hover:scale-110 transition-transform">
                <Smartphone size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-md">Dashboard Owner</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Pantau total omzet, beban kerja penjahit, dan stok bahan baku secara langsung melalui handphone kapan saja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section id="keunggulan" className="py-xl bg-inverse-surface text-inverse-on-surface overflow-hidden">
        <div className="max-w-7xl mx-auto px-md md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-lg leading-tight">
                Pengalaman Manajemen Konveksi Modern di Semua Layar
              </h2>
              <div className="space-y-lg">
                <div className="flex gap-md">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-inverse-primary flex items-center justify-center shrink-0">
                    <Check size={16} />
                  </div>
                  <p className="text-inverse-on-surface/80">
                    Sinkronisasi data otomatis antara aplikasi mobile admin produksi dan dashboard desktop manajemen pusat.
                  </p>
                </div>
                <div className="flex gap-md">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-inverse-primary flex items-center justify-center shrink-0">
                    <Check size={16} />
                  </div>
                  <p className="text-inverse-on-surface/80">
                    Dapat diakses dalam mode offline saat sinyal operator jahit terganggu, data akan tersinkron otomatis saat online.
                  </p>
                </div>
                <div className="flex gap-md">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-inverse-primary flex items-center justify-center shrink-0">
                    <Check size={16} />
                  </div>
                  <p className="text-inverse-on-surface/80">
                    Keamanan data terenkripsi untuk melindungi pola desain pakaian eksklusif dan basis data klien Anda.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative flex justify-center items-center">
              <div className="relative z-20 w-full max-w-[20rem] sm:max-w-[28rem] shadow-2xl rounded-xl border-4 border-outline/50 overflow-hidden bg-slate-950">
                <img 
                  className="w-full h-auto object-cover" 
                  alt="Mobile phone screenshot showing garment sewing queue status tracking interface" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBAq6tar0zn7dfI1mUNpOsI0bjCWee8csbNcxJ7perwXOZl0GNMpGPcADSY1vTUXEnup1UHGOLEFleEYskRde-P73jRMQe0vDxydglhUsOkco_rwa1lWhXBbnRC22s4J7UZlnKjob014UY_ClWOUfvjVYn6jJgQ0aN6ideYQYedYFfHOcdRMcEZggvgqt-aqJbRhZ7OZ-3nIdU9Y9m96_aHOKn4jP5Q-WSxxiN-n4nCYyvppLVDdhQx8xPZiN-uTLp6nRTY8FhDmE"
                />
              </div>
              <div className="absolute -right-20 -top-10 z-10 w-full hidden lg:block opacity-30">
                <img 
                  className="rounded-xl shadow-2xl border-4 border-outline/50" 
                  alt="Desktop convection database showing order status and inventory tracking" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGuHMu1_wmKdvgDlBLfs-dVMj5F9-iH-m5q06JfG8rr15DRS0pDH5vSPirW5O_Wdo9X59CXTneYrlNr34-vAOVm3rSJMudSnbt_UP7VlU-9oTBrF4haPnYevI8193SLk6Xumy9Ffa7ATizvr0XsxXbdDa5f4g2f3YyN3CSFyr5krZgE96GEn41hBpnjucWg6EGgUba8VLKEhL8-qkco2vtYMLCJ_k7MyO5A-mDl9T0M8XrdDKV2vmN_oVyqS8z7JDsGGobz9K_82s"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Ribbon / Marquee Banner */}
      <div className="bg-surface-container-low border-y border-outline-variant/30 py-md overflow-hidden whitespace-nowrap">
        <div className="flex gap-md animate-marquee">
          <div className="inline-flex items-center gap-sm px-lg py-sm bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></span>
            <span className="font-bold">Kaos Event BCA</span>
            <span className="text-primary font-semibold">Telah Selesai Sewing</span>
            <span className="text-xs text-outline">Baru saja</span>
          </div>
          <div className="inline-flex items-center gap-sm px-lg py-sm bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="font-bold">Kemeja BNI KCP</span>
            <span className="text-secondary font-semibold">Sedang Bordir</span>
            <span className="text-xs text-outline">4 mnt lalu</span>
          </div>
          <div className="inline-flex items-center gap-sm px-lg py-sm bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
            <span className="font-bold">Jaket Hoodie Univ</span>
            <span className="text-primary font-semibold">Selesai QC & Packing</span>
            <span className="text-xs text-outline">10 mnt lalu</span>
          </div>
          <div className="inline-flex items-center gap-sm px-lg py-sm bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="font-bold">Seragam Sekolah YPK</span>
            <span className="text-primary font-semibold">Proses Cutting Pola</span>
            <span className="text-xs text-outline">15 mnt lalu</span>
          </div>
          {/* Duplicated for infinite loops */}
          <div className="inline-flex items-center gap-sm px-lg py-sm bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
            <span className="font-bold">Kaos Event BCA</span>
            <span className="text-primary font-semibold">Telah Selesai Sewing</span>
            <span className="text-xs text-outline">Baru saja</span>
          </div>
          <div className="inline-flex items-center gap-sm px-lg py-sm bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <span className="font-bold">Kemeja BNI KCP</span>
            <span className="text-secondary font-semibold">Sedang Bordir</span>
            <span className="text-xs text-outline">4 mnt lalu</span>
          </div>
          <div className="inline-flex items-center gap-sm px-lg py-sm bg-surface-container-lowest border border-outline-variant rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
            <span className="font-bold">Jaket Hoodie Univ</span>
            <span className="text-primary font-semibold">Selesai QC & Packing</span>
            <span className="text-xs text-outline">10 mnt lalu</span>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="py-xl px-md md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="space-y-md">
            <h4 className="text-xl font-extrabold flex items-center gap-sm">
              <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</span>
              <span>Tanpa Setup Ribet</span>
            </h4>
            <p className="text-on-surface-variant">
              Langsung pakai dalam 5 menit. Impor data kain, ukuran, dan nama pekerja dari file Excel dengan sekali klik.
            </p>
          </div>
          <div className="space-y-md">
            <h4 className="text-xl font-extrabold flex items-center gap-sm">
              <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</span>
              <span>Kompatibel Multi Perangkat</span>
            </h4>
            <p className="text-on-surface-variant">
              Gunakan tablet di meja potong/sewing, ponsel di admin lapangan, dan komputer di meja manajemen pusat.
            </p>
          </div>
          <div className="space-y-md">
            <h4 className="text-xl font-extrabold flex items-center gap-sm">
              <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">3</span>
              <span>Backup Cloud Otomatis</span>
            </h4>
            <p className="text-on-surface-variant">
              Semua data produksi aman di server cloud berkemampuan tinggi. Tidak takut kehilangan berkas pesanan klien.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="harga" className="py-xl px-md md:px-margin-desktop">
        <div className="max-w-5xl mx-auto signature-gradient rounded-xl p-xl text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
          <div className="relative z-10 space-y-lg">
            <h2 className="text-3xl sm:text-5xl font-extrabold max-w-2xl mx-auto leading-tight">
              Tingkatkan Kapasitas Produksi Konveksi Anda Sekarang
            </h2>
            <p className="text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto">
              Bergabunglah dengan puluhan bisnis konveksi lain yang tumbuh lebih cepat dan teratur bersama ABG Konveksi.
            </p>
            <button className="px-xl py-lg bg-surface-container-lowest text-primary rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-xl hover:bg-surface-container-low">
              Coba Gratis Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="tentang" className="bg-surface-container-low border-t border-outline-variant/30 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-md md:px-margin-desktop py-lg max-w-7xl mx-auto gap-lg">
          <div className="space-y-xs text-center md:text-left">
            <div className="font-extrabold text-lg text-on-surface">ABG Konveksi</div>
            <p className="text-on-surface-variant text-sm max-w-[20rem]">
              © 2026 ABG Konveksi. Garment Operations System for Convection Growth.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-md md:gap-lg">
            <a className="text-on-surface-variant hover:text-primary text-sm transition-all hover:underline" href="#">Home</a>
            <a className="text-on-surface-variant hover:text-primary text-sm transition-all hover:underline" href="#fitur">Features</a>
            <a className="text-on-surface-variant hover:text-primary text-sm transition-all hover:underline" href="#keunggulan">Benefits</a>
            <a className="text-on-surface-variant hover:text-primary text-sm transition-all hover:underline" href="#">Kebijakan Privasi</a>
            <a className="text-on-surface-variant hover:text-primary text-sm transition-all hover:underline" href="#">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
