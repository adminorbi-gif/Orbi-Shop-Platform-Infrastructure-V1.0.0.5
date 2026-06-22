import React, { useState } from "react";
import {
  Smartphone,
  Shirt,
  Sofa,
  Heart,
  CarFront,
  ShoppingBag,
  X,
  Store,
} from "lucide-react";
import { Lang, t } from "../../lib/i18nClient";
import { useDialog } from "../CustomDialogContext";
import { supabase } from "../../lib/supabase";
import { db } from "../../lib/db";

export function AboutUsSection({ lang }: { lang: Lang }) {
  return (
    <div className="relative z-10 w-full mb-6 rounded-[2rem] overflow-hidden bg-white shadow-sm border border-slate-200/60 p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center text-center" id="about-us-section">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent -z-10"></div>

      {/* Center Content */}
      <div className="flex flex-col items-center relative z-10 w-full max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3 drop-shadow-sm leading-tight text-balance">
          {t(lang, "hero.title")}
        </h1>
        <p className="text-[10px] sm:text-xs text-orange-600 uppercase tracking-[0.2em] font-bold mb-3 sm:mb-4">
          {t(lang, "hero.subtitle")}
        </p>
        <p className="text-sm border-l-2 border-orange-500/30 pl-3 md:text-base text-slate-500 font-medium leading-relaxed mb-6 sm:mb-8 w-full max-w-xl text-balance">
          {t(lang, "hero.desc")}
        </p>

        {/* Trust Badges - Marquee */}
        <div className="w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex flex-row flex-nowrap w-max gap-3 text-[10px] sm:text-xs font-bold text-slate-700 animate-marquee">
            {/* NICHE SET */}
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <Smartphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />{" "}
              <span>{t(lang, "feat.niche1")}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <Shirt className="w-3.5 h-3.5 text-pink-500 shrink-0" />{" "}
              <span>{t(lang, "feat.niche2")}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <Sofa className="w-3.5 h-3.5 text-amber-600 shrink-0" />{" "}
              <span>{t(lang, "feat.niche3")}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />{" "}
              <span>{t(lang, "feat.niche4")}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <CarFront className="w-3.5 h-3.5 text-slate-800 shrink-0" />{" "}
              <span>{t(lang, "feat.niche5")}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{" "}
              <span>{t(lang, "feat.niche6")}</span>
            </div>

            {/* NICHE DUPLICATE SET FOR SEAMLESS LOOP */}
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <Smartphone className="w-3.5 h-3.5 text-blue-500 shrink-0" />{" "}
              <span>{t(lang, "feat.niche1")}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <Shirt className="w-3.5 h-3.5 text-pink-500 shrink-0" />{" "}
              <span>{t(lang, "feat.niche2")}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <Sofa className="w-3.5 h-3.5 text-amber-600 shrink-0" />{" "}
              <span>{t(lang, "feat.niche3")}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />{" "}
              <span>{t(lang, "feat.niche4")}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <CarFront className="w-3.5 h-3.5 text-slate-800 shrink-0" />{" "}
              <span>{t(lang, "feat.niche5")}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100 text-center shrink-0">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{" "}
              <span>{t(lang, "feat.niche6")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApplySellerModal({
  lang,
  onClose,
}: {
  lang: any;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { showAlert } = useDialog();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [info, setInfo] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await db.saveMessage({
        id: "",
        name,
        phone,
        message: `Maombi ya Kuwa Muuzaji:\nJina Kamili: ${name}\nBarua pepe: ${email}\nDuka: ${storeName}\n${info ? "Maelezo zaidi: " + info : ""}`,
        date: Date.now()
      });

      showAlert(
        lang === "sw"
          ? "Ombi lako limepokelewa na litafanyiwa kazi! Tutakutafuta hivi punde."
          : "Your application has been received! Our team will review and contact you shortly.",
        "success",
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      showAlert(
        lang === "sw"
          ? "Imeshindwa kutuma ombi, tafadhali jaribu tena baadae."
          : "Failed to submit application, please try again later.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4 backdrop-blur-sm" id="apply-seller-modal">
      <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none outline-none bg-transparent"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Store size={32} />
          </div>
          <h2 className="text-2xl font-black text-center text-slate-900 tracking-tight">
            {lang === "sw" ? "Omba Kuwa Muuzaji" : "Apply as Seller"}
          </h2>
          <p className="text-sm text-slate-500 text-center mt-2 px-4 leading-relaxed font-medium">
            {lang === "sw"
              ? "Uza bidhaa zako kupitia mfumo wetu unaoaminika. Tutahitaji kuhakiki taarifa zako."
              : "Sell your products on our trusted platform. We will need to verify your details."}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            required
            type="text"
            placeholder={lang === "sw" ? "Jina Kamili" : "Full Name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium"
          />
          <input
            required
            type="email"
            placeholder={lang === "sw" ? "Barua Pepe yako" : "Email Address"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium"
          />
          <input
            required
            type="text"
            placeholder={lang === "sw" ? "Namba ya Simu" : "Phone Number"}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium"
          />
          <input
            required
            type="text"
            placeholder={
              lang === "sw"
                ? "Jina Linalopendekezwa la Duka"
                : "Proposed Store Name"
            }
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium"
          />
          <textarea
            placeholder={
              lang === "sw"
                ? "Maelezo ya ziada kuhusu bidhaa zako"
                : "Additional info about your products"
            }
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-orange-500 focus:bg-white font-medium min-h-[100px] resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-850 text-white py-3.5 rounded-xl font-bold mt-4 disabled:opacity-50 transition-all shadow-sm cursor-pointer border-none"
          >
            {loading
              ? lang === "sw"
                ? "Inatuma..."
                : "Submitting..."
              : lang === "sw"
                ? "Tuma Ombi"
                : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
