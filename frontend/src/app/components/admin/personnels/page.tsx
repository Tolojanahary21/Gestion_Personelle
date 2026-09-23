"use client";

import TextPage from "./textPage";
import StatCards from "./StatCards";
import PersonnelList from "./PersonnelList";
export default function Personnel(){
    return(
        <main className="ml-70">    
            <TextPage/>
            <StatCards/>
            <PersonnelList/>
        </main>
    )
}