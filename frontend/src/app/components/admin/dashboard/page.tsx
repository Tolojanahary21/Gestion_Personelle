 
import Header from "./graph/Header";
import StatsCards from "./graph/StatsCards";
import Personnel from "./graph/Personnel";
import Effectifs from "./graph/effectifs";
import LastActivities from "./graph/lastActivities";
export default function DashboardPage() {
  return (
   
    
       <div className="">
        <Header />
        <StatsCards />
        <Personnel />
        <Effectifs />
        <LastActivities />
       </div>
    
  );
}