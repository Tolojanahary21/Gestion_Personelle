 
import Header from "./graph/Header";
import StatsCards from "./graph/StatsCards";
import Personnel from "./graph/Personnel";
import Effectifs from "./graph/effectifs";
import LastActivities from "./graph/lastActivities";
export default function DashboardPage({ onMenuClick }: { onMenuClick: () => void }) {
  return (
   
    
       <div className="">
        <Header onMenuClick={onMenuClick} />
        <StatsCards />
        <Personnel />
        <Effectifs />
        <LastActivities />
       </div>
    
  );
}
