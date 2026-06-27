"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Plus, Trash2, IndianRupee, Phone, MessageSquare, Video } from "lucide-react";

type PackageType = "call" | "chat" | "video";

interface PricingPackage {
  id: string;
  type: PackageType;
  duration: number; // in minutes
  price: number;
}

export default function PricingManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  
  const [newType, setNewType] = useState<PackageType>("call");
  const [newDuration, setNewDuration] = useState<string>("10");
  const [newPrice, setNewPrice] = useState<string>("");

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch("/api/astrologer/pricing");
        if (res.ok) {
          const data = await res.json();
          setPackages(data.pricingPackages || []);
        }
      } catch (error) {
        console.error("Failed to fetch pricing", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const handleAddPackage = () => {
    if (!newDuration || !newPrice) {
      setMessage("Please fill out both duration and price.");
      return;
    }
    
    const duration = parseInt(newDuration, 10);
    const price = parseInt(newPrice, 10);

    if (duration <= 0 || price <= 0) {
      setMessage("Duration and price must be greater than 0.");
      return;
    }

    // Check if this type+duration already exists
    const exists = packages.find(p => p.type === newType && p.duration === duration);
    if (exists) {
      setMessage(`You already have a ${duration} minute ${newType} package.`);
      return;
    }

    const newPkg: PricingPackage = {
      id: Math.random().toString(36).substr(2, 9),
      type: newType,
      duration,
      price
    };

    setPackages([...packages, newPkg]);
    setNewPrice("");
    setMessage("");
  };

  const handleRemovePackage = (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
    setMessage("");
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/astrologer/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricingPackages: packages }),
      });

      if (!res.ok) {
        throw new Error("Failed to save pricing");
      }

      setMessage("Pricing packages saved successfully!");
    } catch (err: any) {
      setMessage(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading your packages...</div>;
  }

  const getTypeIcon = (type: PackageType) => {
    switch (type) {
      case "call": return <Phone className="w-5 h-5 text-green-600" />;
      case "chat": return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case "video": return <Video className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message}
        </div>
      )}

      {/* Add New Package Form */}
      <div className="bg-cream/40 p-5 rounded-2xl border border-ink/5 flex flex-col md:flex-row items-end gap-4 shadow-sm">
        <div className="w-full">
          <label className="block text-xs font-semibold text-ink mb-1.5">Consultation Type</label>
          <select 
            value={newType} 
            onChange={(e) => setNewType(e.target.value as PackageType)}
            className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 outline-none"
          >
            <option value="call">Voice Call</option>
            <option value="chat">Chat</option>
            <option value="video">Video Call</option>
          </select>
        </div>
        
        <div className="w-full">
          <label className="block text-xs font-semibold text-ink mb-1.5">Duration (Minutes)</label>
          <input 
            type="number" 
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
            placeholder="e.g. 10"
            className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 outline-none" 
          />
        </div>

        <div className="w-full">
          <label className="block text-xs font-semibold text-ink mb-1.5">Price (₹)</label>
          <div className="relative">
            <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input 
              type="number" 
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="e.g. 180"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 bg-white text-sm focus:ring-2 focus:ring-bhagva/20 outline-none" 
            />
          </div>
        </div>
        
        <button 
          type="button"
          onClick={handleAddPackage}
          className="w-full md:w-auto md:px-8 py-3 rounded-xl bg-bhagva text-white font-bold text-sm shadow-md hover:bg-bhagva/90 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Package List */}
      <div>
        <h3 className="font-bold font-heading text-lg mb-4 text-ink">Your Packages</h3>
        {packages.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-ink/20 rounded-2xl text-ink-muted flex flex-col items-center bg-white/50">
            <IndianRupee className="w-12 h-12 mb-3 opacity-20" />
            <p>You haven&apos;t created any pricing packages yet.</p>
            <p className="text-sm mt-1">Add your first package above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white p-5 rounded-2xl border border-ink/10 shadow-sm flex justify-between items-center group hover:border-bhagva/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cream-tint flex items-center justify-center">
                    {getTypeIcon(pkg.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-ink flex items-center gap-1">
                      {pkg.duration} Minutes
                    </h4>
                    <p className="text-sm font-medium text-bhagva mt-0.5">
                      ₹{pkg.price}
                    </p>
                    <p className="text-xs text-ink-muted mt-1 uppercase tracking-wide">
                      {pkg.type} Consultation
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemovePackage(pkg.id)}
                  className="p-2 text-ink-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  aria-label="Remove package"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-6 flex justify-end border-t border-ink/10">
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="w-full md:w-auto px-10 py-3.5 rounded-xl bg-night text-white font-bold text-sm shadow-md hover:bg-night/90 transition-colors flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Pricing Configuration"}
        </button>
      </div>
    </div>
  );
}
