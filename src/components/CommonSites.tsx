import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const commonSites = [
  { name: "114上學期行事曆", url: "/114學年度第一學期行事曆.pdf" },
  { name: "晨間英語多媒體播放", url: "/英聽挑戰.pdf" },
  { name: "段考成績查詢", url: "http://120.115.12.4/" },
  { name: "12年國教專區", url: "https://jhquery.tn.edu.tw/" },
  { name: "國中學生輔導資料", url: "https://jhc.tn.edu.tw/Login.action" },
  { name: "翰林雲端學院TEAMS", url: "https://cmjhtn.teamslite.com.tw/v2/login.html" },
  { name: "教育部因材網", url: "https://adl.edu.tw/HomePage/home/" },
  { name: "布可星球", url: "https://read.tn.edu.tw/" },
];

export function CommonSites() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section id="common-sites" className="mb-12 scroll-mt-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">常用網站</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              收起
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              展開
            </>
          )}
        </Button>
      </div>
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {commonSites.map((site) => (
            <a
              key={site.name}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-gradient-to-br from-card to-card/50 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:border-primary hover:scale-105 hover:bg-primary/5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {site.name}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
