"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import VisitPage from "./subpages/VisitPage";
import VolunteerPage from "./subpages/VolunteerPage";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";

export default function EventAcessPage() {
    const params = useParams();
    const codeEvent = params?.code_event as string;
    const code = params?.code as string;
    const router = useRouter();

    const [type, setType] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sessionStorage.getItem("event_access")) {
            sessionStorage.setItem("event_access", "true");
        }
    }, []);

    useEffect(() => {
        async function fetchType() {
            setLoading(true);
            const { data, error } = await supabase
                .from("public_event_lookup")
                .select("type")
                .eq("code_event", codeEvent)
                .eq("code", code)
                .single();

            if (error) {
                console.error(error);
                setType(null);
            } else {
                setType(data?.type ?? null);
            }
            setLoading(false);
        }

        if (codeEvent && code) {
            fetchType();
        }
    }, [codeEvent, code]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
                <Loader />
            </div>
        );
    }


    if (!type) {
      router.push("/universe");
    }

    return (
        <div>
            {type === "visit" && <VisitPage />}
            {type === "volunteer" && <VolunteerPage />}
        </div>
    );
}
