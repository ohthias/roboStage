import KnockoutBracket from "@/components/TeamBracket";

export default function TestPage() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
       <KnockoutBracket
        leftSemiFinal={["Team A", "Team B"]}
        rightSemiFinal={["Team C", "Team D"]}
        finalTeams={["Team E", "Team F"]}
        finalWinner={"Team E"}
      />
    </div>
  );
}
