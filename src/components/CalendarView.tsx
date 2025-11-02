import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
  date: string;
  title: string;
}

type CalendarData = {
  [key: string]: CalendarEvent[];
};

export function CalendarView() {
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetch("/data/calendar.json")
      .then((res) => res.json())
      .then((data: CalendarData) => {
        setCalendarData(data);
        // Set current month or closest available month
        const today = new Date();
        const currentYM = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
        const months = Object.keys(data).sort();
        setSelectedMonth(months.includes(currentYM) ? currentYM : months[0] || "");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load calendar:", error);
        setLoading(false);
      });
  }, []);

  const months = Object.keys(calendarData).sort();
  const currentMonthIndex = months.indexOf(selectedMonth);

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      setDirection('left');
      setSelectedDay(null);
      setSelectedMonth(months[currentMonthIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < months.length - 1) {
      setDirection('right');
      setSelectedDay(null);
      setSelectedMonth(months[currentMonthIndex + 1]);
    }
  };

  const renderCalendar = () => {
    if (!selectedMonth || !calendarData[selectedMonth]) return null;

    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const today = new Date();

    const events = calendarData[selectedMonth];
    const eventsByDay: { [key: number]: CalendarEvent[] } = {};
    events.forEach((event) => {
      const day = parseInt(event.date.split("-")[2], 10);
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(event);
    });

    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const calendarCells = [];

    // Weekday headers
    weekdays.forEach((day) => {
      calendarCells.push(
        <div key={`header-${day}`} className="text-center font-semibold text-muted-foreground py-3 text-sm md:text-base">
          {day}
        </div>
      );
    });

    // Empty cells before first day
    for (let i = 0; i < startWeekday; i++) {
      calendarCells.push(<div key={`empty-${i}`} className="min-h-[100px] md:min-h-[100px]" />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() + 1 &&
        day === today.getDate();

      const dayEvents = eventsByDay[day] || [];

      const isSelected = selectedDay === day;
      const hasEvents = dayEvents.length > 0;

      // 如果是選中的日期，佔滿整週
      if (isSelected) {
        calendarCells.push(
          <div
            key={`day-${day}`}
            onClick={() => setSelectedDay(null)}
            className="col-span-7 bg-primary/5 border-2 border-primary rounded-lg p-4 cursor-pointer transition-all hover:bg-primary/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{day}</span>
                {isToday && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                    今天
                  </span>
                )}
              </div>
              <span className="text-sm text-muted-foreground">點擊收起</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {dayEvents.length > 0 ? (
                dayEvents.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-card p-3 rounded-md border border-border">
                    <span className="text-primary text-xl">•</span>
                    <span className="text-sm text-card-foreground flex-1">{event.title}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  本日無事件
                </div>
              )}
            </div>
          </div>
        );
        continue;
      }

      calendarCells.push(
        <div
          key={`day-${day}`}
          onClick={() => setSelectedDay(day)}
          className={`min-h-[80px] md:min-h-[100px] p-1.5 md:p-3 rounded-lg border transition-all cursor-pointer ${
            isToday
              ? "bg-primary/10 border-primary ring-2 ring-primary/20"
              : "bg-card border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <div className="font-semibold mb-1 flex items-center justify-between">
            <span className={`text-xs md:text-base ${isToday ? "text-primary" : "text-foreground"}`}>
              {day}
            </span>
            {isToday && (
              <span className="text-[8px] md:text-xs bg-primary text-primary-foreground px-1 md:px-2 py-0.5 rounded">
                今天
              </span>
            )}
          </div>
          <div className="space-y-0.5">
            {/* 桌面版：顯示前2個事件 */}
            <div className="hidden md:block">
              {dayEvents.slice(0, 2).map((event, idx) => (
                <div key={idx} className="text-xs text-muted-foreground line-clamp-2 mb-0.5">
                  • {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-primary font-medium">
                  +{dayEvents.length - 2}
                </div>
              )}
            </div>
            {/* 手機版：顯示事件數量 */}
            <div className="md:hidden">
              {dayEvents.length > 0 && (
                <div className="text-[9px] text-primary font-medium">
                  {dayEvents.length} 個事件
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return calendarCells;
  };

  const selectedEvents = selectedMonth ? calendarData[selectedMonth] || [] : [];

  if (loading) {
    return (
      <section id="calendar" className="mb-12 scroll-mt-20">
        <h2 className="text-3xl font-bold mb-6 text-foreground">行事曆</h2>
        <div className="text-muted-foreground">載入中...</div>
      </section>
    );
  }

  return (
    <section id="calendar" className="mb-12 scroll-mt-20">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-foreground">行事曆</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            disabled={currentMonthIndex <= 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => {
                const [year, mon] = month.split("-");
                return (
                  <SelectItem key={month} value={month}>
                    {year}年{parseInt(mon, 10)}月
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            disabled={currentMonthIndex >= months.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div 
        key={selectedMonth}
        className={`bg-muted/30 rounded-xl p-2 md:p-4 mb-6 ${direction === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
      >
        <div className="grid grid-cols-7 gap-1 md:gap-2">{renderCalendar()}</div>
      </div>

      {selectedEvents.length > 0 && (
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="font-semibold mb-3 text-foreground">
            本月事件 ({selectedEvents.length})
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {selectedEvents.map((event, idx) => {
              const day = event.date.split("-")[2];
              return (
                <div key={idx} className="text-sm flex gap-3">
                  <span className="text-muted-foreground font-medium min-w-[40px]">
                    {parseInt(day, 10)}日
                  </span>
                  <span className="text-card-foreground">{event.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
