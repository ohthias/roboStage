import Breadcrumbs from "@/components/Breadcrumbs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";

export default function RobotTrack() {
    return (
        <div className="flex flex-col items-start w-full">
            <Navbar />
            <Breadcrumbs />
            <div className="flex flex-col items-center w-full py-6">
                <h1 className="text-3xl font-bold text-primary mb-4">Robot Track</h1>
                <p className="text-center text-base-content max-w-3xl px-4 mb-6">
                    O Robot Track é uma ferramenta para planejar e visualizar o percurso do seu robô no tapete de competição. Com ele, você pode ajustar ângulos, distâncias e estratégias para otimizar o desempenho do seu robô durante a FIRST LEGO League Challenge.
                </p>
            </div>
            <Footer />
        </div>
    );
}