"use client";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Settings, HelpCircle, LogOut, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/service/authService";

export function KasirSidebar({ activePath }: { activePath: string }) {
  const router = useRouter();
  const handleLogout = async () => {
      await authService.logout();
      router.push("/pages/login");
    };
  return (
    <aside className="bg-surface-container dark:bg-surface-container-low h-screen w-72 flex flex-col fixed left-0 top-0 border-r border-outline-variant dark:border-outline z-50">
      <div className="flex flex-col h-full py-6">
        <div className="px-6 mb-8">
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed">GarmentOps</h1>
          <p className="font-label-md text-label-md text-on-surface-variant">Kasir Console</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <Link 
            href="/pages/kasir" 
            className={`flex items-center px-6 py-3 transition-colors ${
              activePath === "home" 
                ? "text-primary dark:text-primary-fixed-dim font-bold border-r-4 border-primary dark:border-primary-fixed bg-primary-container/10 dark:bg-primary-container/20" 
                : "text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface hover:bg-primary-container/10 dark:hover:bg-primary-container/20"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-4" />
            <span className="font-label-md text-label-md">Beranda</span>
          </Link>
          
          
          <Link 
            href="/pages/kasir/order" 
            className={`flex items-center px-6 py-3 transition-colors ${
              activePath === "order" 
                ? "text-primary dark:text-primary-fixed-dim font-bold border-r-4 border-primary dark:border-primary-fixed bg-primary-container/10 dark:bg-primary-container/20" 
                : "text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface hover:bg-primary-container/10 dark:hover:bg-primary-container/20"
            }`}
          >
            <Receipt className="w-5 h-5 mr-4" />
            <span className="font-label-md text-label-md">Pesanan</span>
          </Link>
          <Link 
            href="/pages/kasir/report" 
            className={`flex items-center px-6 py-3 transition-colors ${
              activePath === "report" 
                ? "text-primary dark:text-primary-fixed-dim font-bold border-r-4 border-primary dark:border-primary-fixed bg-primary-container/10 dark:bg-primary-container/20" 
                : "text-on-surface-variant dark:text-on-surface-variant hover:text-on-surface hover:bg-primary-container/10 dark:hover:bg-primary-container/20"
            }`}
          >
            <ShoppingBag className="w-5 h-5 mr-4" />
            <span className="font-label-md text-label-md">Report</span>
          </Link>
        </nav>
        
         <div className="mt-auto px-6 space-y-1 pt-6 border-t border-outline-variant dark:border-outline">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-error hover:text-error hover:bg-error/10 dark:hover:bg-error/20 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-4" />
            <span className="font-label-md text-label-md font-bold">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
