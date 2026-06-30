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
      <nav className="bg-surface/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm border-b border-slate-100">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-extrabold tracking-tight text-indigo-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg signature-gradient flex items-center justify-center text-white text-sm font-black">
              A
            </span>
            <span>ABG Konveksi</span>
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a className={`font-semibold transition-all duration-300 py-1 ${activeSection === "fitur" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600 hover:text-indigo-500"}`} href="#fitur">
              Fitur
            </a>
            <a className={`font-semibold transition-all duration-300 py-1 ${activeSection === "keunggulan" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600 hover:text-indigo-500"}`} href="#keunggulan">
              Keunggulan
            </a>
            <a className={`font-semibold transition-all duration-300 py-1 ${activeSection === "harga" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600 hover:text-indigo-500"}`} href="#harga">
              Harga
            </a>
            <a className={`font-semibold transition-all duration-300 py-1 ${activeSection === "tentang" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600 hover:text-indigo-500"}`} href="#tentang">
              Tentang Kami
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-slate-600 font-medium hover:text-indigo-600 transition-all">
              Masuk
            </Link>
            <Link href="/download" className="px-6 py-2.5 signature-gradient text-white rounded-full font-bold scale-105 transition-transform hover:opacity-90 shadow-md flex items-center gap-2">
              <Smartphone size={18} />
              Download Aplikasi
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-700 hover:text-indigo-600 p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 p-6 space-y-4 shadow-xl">
            <a 
              className={`block font-semibold ${activeSection === "fitur" ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"}`} 
              href="#fitur" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Fitur
            </a>
            <a 
              className={`block font-semibold ${activeSection === "keunggulan" ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"}`} 
              href="#keunggulan" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Keunggulan
            </a>
            <a 
              className={`block font-semibold ${activeSection === "harga" ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"}`} 
              href="#harga" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Harga
            </a>
            <a 
              className={`block font-semibold ${activeSection === "tentang" ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"}`} 
              href="#tentang" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Tentang Kami
            </a>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
              <Link href="/login" className="w-full text-slate-700 font-medium py-2 hover:opacity-80 transition-all text-center block">
                Masuk
              </Link>
              <Link href="/download" className="w-full px-6 py-2.5 signature-gradient text-white rounded-full font-bold text-center flex items-center justify-center gap-2">
                <Smartphone size={18} />
                Download Aplikasi
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold">
              <Sparkles size={14} className="text-indigo-600 animate-pulse" />
              Sistem Operasional Konveksi No. 1 di Indonesia
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-on-surface leading-[1.1]">
              Kelola Produksi Konveksi <span className="text-transparent bg-clip-text signature-gradient">Lebih Mudah</span> & Cepat
            </h1>
            <p className="text-lg sm:text-xl text-on-surface-variant max-w-lg leading-relaxed">
              Pantau antrean jahit, status potong, pembayaran DP, hingga pengiriman barang dalam satu platform cloud terintegrasi khusus untuk bisnis konveksi.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/login" className="inline-flex justify-center items-center px-8 py-4 signature-gradient text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg hover:shadow-indigo-500/20">
                Mulai Sekarang
              </Link>
              <Link href="/download" className="inline-flex justify-center items-center px-8 py-4 border-2 border-slate-200 text-on-surface rounded-full font-bold text-lg hover:bg-slate-50 transition-all gap-2">
                <Smartphone size={20} />
                Download Aplikasi Mobile
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 ambient-shadow rounded-2xl overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-700 border border-slate-100 bg-white">
              <img 
                className="w-full h-auto object-cover" 
                alt="Modern convection and garment management dashboard with analytics and order queues" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAF7uLtmNhy8kyv5U85K1sGZeomJ530f6sgke21nOs_lkyEvWHYS6cnB9PgIKnbXKekNCnbcetm8MelvU-OLEvhpjLUd4WWlvDy6W1sS0htl_BrVwKc3irzUK9Yl68Uk5Qn7KUelAGcPsal08-LjJry77xS7X0ZmA_inQ9TbRfX838Wl_tdCX0OQ3Mr9-rrO6NsiPkftHJ52t6Aa4lJUVr71pCmvpCG2HmGLFZxnvQAKJgE1WQacqESrHPynnWS8fWnCETfvFS0L9U"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-8 -left-8 z-20 bg-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce-slow border border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Produksi Hari Ini</p>
                <p className="text-xl font-extrabold text-slate-900">+84 Pcs Kemeja</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">
            Dipercaya Oleh 50+ Brand Konveksi & Garment di Seluruh Indonesia
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            <div className="font-extrabold text-slate-400 text-lg tracking-wider">CONVEXA.CO</div>
            <div className="font-extrabold text-slate-400 text-lg tracking-wider">GARMENTINDO</div>
            <div className="font-extrabold text-slate-400 text-lg tracking-wider">APAREL GROUP</div>
            <div className="font-extrabold text-slate-400 text-lg tracking-wider">TAILORSMITH</div>
            <div className="font-extrabold text-slate-400 text-lg tracking-wider">STYLEWERK</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface">
              Fitur Cerdas untuk Efisiensi Bisnis Konveksi
            </h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg">
              Semua yang Anda butuhkan untuk mendigitalisasi lantai produksi tanpa kerumitan teknis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cards */}
            <div className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Layers size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Manajemen Antrean</h3>
              <p className="text-slate-500 leading-relaxed">
                Pantau alur kerja dari cutting, bordir, sewing, QC, hingga packing secara real-time dan bebas antrean menumpuk.
              </p>
            </div>

            <div className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Laporan Omzet & HPP</h3>
              <p className="text-slate-500 leading-relaxed">
                Kalkulasi otomatis Harga Pokok Produksi (HPP), omzet penjualan, dan profit margin per pesanan secara akurat.
              </p>
            </div>

            <div className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Search size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Pelacakan Klien (Live)</h3>
              <p className="text-slate-500 leading-relaxed">
                Klien dapat melacak status jahit pesanan mereka secara mandiri menggunakan tautan pelacakan khusus tanpa perlu chat WhatsApp.
              </p>
            </div>

            {/* Dark Wide Card */}
            <div className="md:col-span-2 p-10 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group border border-slate-800">
              <div className="relative z-10 max-w-md">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-8">
                  <CreditCard size={28} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Multi Pembayaran & DP</h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Kelola pembayaran uang muka (DP), pelunasan bertahap, dan integrasi transfer bank otomatis dengan kuitansi digital instan.
                </p>
              </div>
              <div className="absolute right-[-5%] bottom-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <CreditCard size={240} className="text-white" />
              </div>
            </div>

            <div className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Smartphone size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Dashboard Owner</h3>
              <p className="text-slate-500 leading-relaxed">
                Pantau total omzet, beban kerja penjahit, dan stok bahan baku secara langsung melalui handphone kapan saja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section id="keunggulan" className="py-32 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-8 leading-tight">
                Pengalaman Manajemen Konveksi Modern di Semua Layar
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
                    <Check size={16} />
                  </div>
                  <p className="text-slate-300">
                    Sinkronisasi data otomatis antara aplikasi mobile admin produksi dan dashboard desktop manajemen pusat.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
                    <Check size={16} />
                  </div>
                  <p className="text-slate-300">
                    Dapat diakses dalam mode offline saat sinyal operator jahit terganggu, data akan tersinkron otomatis saat online.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
                    <Check size={16} />
                  </div>
                  <p className="text-slate-300">
                    Keamanan data terenkripsi untuk melindungi pola desain pakaian eksklusif dan basis data klien Anda.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative flex justify-center items-center">
              <div className="relative z-20 w-full max-w-xs sm:max-w-md shadow-2xl rounded-2xl border-4 border-slate-800 overflow-hidden bg-slate-950">
                <img 
                  className="w-full h-auto object-cover" 
                  alt="Mobile phone screenshot showing garment sewing queue status tracking interface" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBAq6tar0zn7dfI1mUNpOsI0bjCWee8csbNcxJ7perwXOZl0GNMpGPcADSY1vTUXEnup1UHGOLEFleEYskRde-P73jRMQe0vDxydglhUsOkco_rwa1lWhXBbnRC22s4J7UZlnKjob014UY_ClWOUfvjVYn6jJgQ0aN6ideYQYedYFfHOcdRMcEZggvgqt-aqJbRhZ7OZ-3nIdU9Y9m96_aHOKn4jP5Q-WSxxiN-n4nCYyvppLVDdhQx8xPZiN-uTLp6nRTY8FhDmE"
                />
              </div>
              <div className="absolute -right-20 -top-10 z-10 w-full hidden lg:block opacity-30">
                <img 
                  className="rounded-xl shadow-2xl border-4 border-slate-800" 
                  alt="Desktop convection database showing order status and inventory tracking" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGuHMu1_wmKdvgDlBLfs-dVMj5F9-iH-m5q06JfG8rr15DRS0pDH5vSPirW5O_Wdo9X59CXTneYrlNr34-vAOVm3rSJMudSnbt_UP7VlU-9oTBrF4haPnYevI8193SLk6Xumy9Ffa7ATizvr0XsxXbdDa5f4g2f3YyN3CSFyr5krZgE96GEn41hBpnjucWg6EGgUba8VLKEhL8-qkco2vtYMLCJ_k7MyO5A-mDl9T0M8XrdDKV2vmN_oVyqS8z7JDsGGobz9K_82s"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Ribbon / Marquee Banner */}
      <div className="bg-slate-50 border-y border-slate-100 py-8 overflow-hidden whitespace-nowrap">
        <div className="flex gap-6 animate-marquee">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-bold">Kaos Event BCA</span>
            <span className="text-indigo-600 font-semibold">Telah Selesai Sewing</span>
            <span className="text-xs text-slate-400">Baru saja</span>
          </div>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span className="font-bold">Kemeja BNI KCP</span>
            <span className="text-amber-500 font-semibold">Sedang Bordir</span>
            <span className="text-xs text-slate-400">4 mnt lalu</span>
          </div>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold">Jaket Hoodie Univ</span>
            <span className="text-indigo-600 font-semibold">Selesai QC & Packing</span>
            <span className="text-xs text-slate-400">10 mnt lalu</span>
          </div>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span className="font-bold">Seragam Sekolah YPK</span>
            <span className="text-indigo-500 font-semibold">Proses Cutting Pola</span>
            <span className="text-xs text-slate-400">15 mnt lalu</span>
          </div>
          {/* Duplicated for infinite loops */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold">Kaos Event BCA</span>
            <span className="text-indigo-600 font-semibold">Telah Selesai Sewing</span>
            <span className="text-xs text-slate-400">Baru saja</span>
          </div>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span className="font-bold">Kemeja BNI KCP</span>
            <span className="text-amber-500 font-semibold">Sedang Bordir</span>
            <span className="text-xs text-slate-400">4 mnt lalu</span>
          </div>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-bold">Jaket Hoodie Univ</span>
            <span className="text-indigo-600 font-semibold">Selesai QC & Packing</span>
            <span className="text-xs text-slate-400">10 mnt lalu</span>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h4 className="text-xl font-extrabold flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">1</span>
              <span>Tanpa Setup Ribet</span>
            </h4>
            <p className="text-slate-500">
              Langsung pakai dalam 5 menit. Impor data kain, ukuran, dan nama pekerja dari file Excel dengan sekali klik.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xl font-extrabold flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">2</span>
              <span>Kompatibel Multi Perangkat</span>
            </h4>
            <p className="text-slate-500">
              Gunakan tablet di meja potong/sewing, ponsel di admin lapangan, dan komputer di meja manajemen pusat.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xl font-extrabold flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">3</span>
              <span>Backup Cloud Otomatis</span>
            </h4>
            <p className="text-slate-500">
              Semua data produksi aman di server cloud berkemampuan tinggi. Tidak takut kehilangan berkas pesanan klien.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="harga" className="py-20 px-6">
        <div className="max-w-5xl mx-auto signature-gradient rounded-[3rem] p-12 sm:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl sm:text-5xl font-extrabold max-w-2xl mx-auto leading-tight">
              Tingkatkan Kapasitas Produksi Konveksi Anda Sekarang
            </h2>
            <p className="text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto">
              Bergabunglah dengan puluhan bisnis konveksi lain yang tumbuh lebih cepat dan teratur bersama ABG Konveksi.
            </p>
            <button className="px-10 py-5 bg-white text-indigo-800 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-xl hover:bg-slate-50">
              Coba Gratis Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="tentang" className="bg-slate-50 border-t border-slate-100 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 py-12 max-w-7xl mx-auto gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="font-extrabold text-lg text-slate-900">ABG Konveksi</div>
            <p className="text-slate-500 text-sm max-w-xs">
              © 2026 ABG Konveksi. Garment Operations System for Convection Growth.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <a className="text-slate-500 hover:text-indigo-600 text-sm transition-all hover:underline" href="#">Home</a>
            <a className="text-slate-500 hover:text-indigo-600 text-sm transition-all hover:underline" href="#fitur">Features</a>
            <a className="text-slate-500 hover:text-indigo-600 text-sm transition-all hover:underline" href="#keunggulan">Benefits</a>
            <a className="text-slate-500 hover:text-indigo-600 text-sm transition-all hover:underline" href="#">Kebijakan Privasi</a>
            <a className="text-slate-500 hover:text-indigo-600 text-sm transition-all hover:underline" href="#">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
