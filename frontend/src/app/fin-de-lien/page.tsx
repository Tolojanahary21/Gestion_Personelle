"use client"

import Sidebar from "../components/sidebar/Sidebar"
import FinDeLien from "./FinDeLien"

export default function FinDeLienPage(){
    return(
        <div className=" flex min-h-screen bg-slate-50">
            <Sidebar/>
            <main className="flex-1 overflow-x-hidden">
                <FinDeLien/>
            </main>

        </div>
    )
}
