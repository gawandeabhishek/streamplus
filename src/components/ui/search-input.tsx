"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setValue(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (term: string) => {
    setValue(term);
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <Input
      type="search"
      placeholder="Search videos..."
      value={value}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
} 