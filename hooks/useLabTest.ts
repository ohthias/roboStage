"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { labTestService } from "@/services/labTestService";
import { CreateLabTestDTO } from "@/types/labTest.types";

export function useLabTest() {
  const { user } = useAuth();

  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTests = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const data = await labTestService.getByUser(user.id);

      setTests(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createTest = async (payload: CreateLabTestDTO) => {
    if (!user?.id) {
      throw new Error("Usuário não autenticado");
    }

    const test = await labTestService.create(
      user.id,
      payload
    );

    await loadTests();

    return test;
  };

  const deleteTest = async (id: string) => {
    await labTestService.delete(id);

    setTests((prev) =>
      prev.filter((test) => test.id !== id)
    );
  };

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  return {
    tests,
    loading,

    loadTests,
    createTest,
    deleteTest,
  };
}