import React, { useCallback, useEffect, useRef, useState } from "react";
const textGameHeader = {
  default: "LET'S PLAY",
  end: "ALL CLEARED",
  missed: "GAME OVER",
};

const colorHeader = {
  default: "text-black",
  end: "text-green-600",
  missed: "text-orange-600",
};

const TIME_COUNT_DOWN = 3000;
const STEP_TIME_COUNT_DOWN = 200;
function Game() {
  // Các state để quản lý trạng thái trò chơi
  const [textHeader, setTextHeader] = useState({
    text: textGameHeader.default,
    color: colorHeader.default,
  });
  const [points, setPoints] = useState(5); // Số lượng điểm (vòng tròn)
  const [time, setTime] = useState(0); // Thời gian đã trôi qua
  const [isPlaying, setIsPlaying] = useState(false); // Trạng thái đang chơi
  const [autoPlay, setAutoPlay] = useState(false); // Chế độ tự động chơi
  const [nextNumber, setNextNumber] = useState(1); // Số tiếp theo cần nhấp
  const [circles, setCircles] = useState([]); // Mảng chứa thông tin các vòng tròn
  const [clickedNumbers, setClickedNumbers] = useState([]); // Các số đã được nhấp
  const [clickTimes, setClickTimes] = useState({}); // Thời gian nhấp cho mỗi vòng tròn

  // Hàm tạo các vòng tròn với vị trí ngẫu nhiên
  const generateCircles = useCallback(() => {
    const newCircles = [];
    for (let i = points; i >= 1; i--) {
      // Loop from points to 1
      newCircles.push({
        id: i,
        x: Math.random() * 80 + 10, // Random position from 10% to 90%
        y: Math.random() * 80 + 10,
      });
    }
    setCircles(newCircles);
  }, [points]);

  // Hàm bắt đầu trò chơi mới
  const startGame = useCallback(() => {
    setTime(0);
    setNextNumber(1);
    setClickedNumbers([]);
    setClickTimes({});
    setIsPlaying(true);
    generateCircles();
    setTextHeader({
      text: textGameHeader.default,
      color: colorHeader.default,
    });
  }, [generateCircles]);

  // Xử lý khi nhấp vào một vòng tròn
  const handleCircleClick = useCallback(
    (id) => {
      setClickedNumbers((prev) => [...prev, id]);
      setClickTimes((prev) => ({ ...prev, [id]: TIME_COUNT_DOWN })); // Start countdown from TIME_COUNT_DOWN ms
      if (id === nextNumber) {
        if (nextNumber === points) {
          const TIME_END =
            STEP_TIME_COUNT_DOWN * (TIME_COUNT_DOWN / STEP_TIME_COUNT_DOWN + 2);
          const timeoutEnd = setTimeout(() => {
            setIsPlaying(false); // End game if all numbers clicked
            setTextHeader({
              text: textGameHeader.end,
              color: colorHeader.end,
            });
          }, TIME_END);
          return () => clearTimeout(timeoutEnd);
        } else {
          setNextNumber((prev) => prev + 1);
        }
      } else {
        setTextHeader({
          text: textGameHeader.missed,
          color: colorHeader.missed,
        });
        setIsPlaying(false);
      }
    },
    [nextNumber, points]
  );

  // Quản lý thời gian tổng thể của trò chơi
  useEffect(() => {
    const STEP_TIME = 100;
    if (isPlaying) {
      const interval = setInterval(() => {
        setTime((prev) => parseFloat((prev + 0.1).toFixed(1)));
      }, STEP_TIME);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Quản lý thời gian đếm ngược của từng vòng tròn
  const timersRef = useRef({});

  useEffect(() => {
    if (isPlaying) {
      Object.keys(clickTimes).forEach((id) => {
        if (clickTimes[id] > 0 && !timersRef.current[id]) {
          timersRef.current[id] = setInterval(() => {
            setClickTimes((prev) => {
              const remainingTime = prev[id] - STEP_TIME_COUNT_DOWN;
              if (remainingTime <= 0) {
                clearInterval(timersRef.current[id]);
                delete timersRef.current[id];
                return { ...prev, [id]: 0 };
              }
              return { ...prev, [id]: remainingTime };
            });
          }, STEP_TIME_COUNT_DOWN);
        }
      });
    }

    // Cleanup all timers when `isPlaying` changes
    return () => {
      Object.keys(timersRef.current).forEach((id) =>
        clearInterval(timersRef.current[id])
      );
      timersRef.current = {}; // Reset ref to clean up all timers
    };
  }, [isPlaying, clickTimes]);
  console.log(clickTimes);

  // Effect để quản lý chế độ tự động chơi
  useEffect(() => {
    let timeout;
    if (autoPlay && isPlaying) {
      timeout = setTimeout(() => {
        handleCircleClick(nextNumber);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [autoPlay, isPlaying, nextNumber, handleCircleClick]);

  // Hàm xác định style cho từng vòng tròn dựa trên trạng thái
  const getCircleStyle = (id) => {
    if (clickedNumbers.includes(id)) {
      return "border-red-500 bg-red-500 text-white"; // Đã nhấp
    }
    return "border-gray-800 bg-white text-gray-800"; // Chưa đến lượt
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 space-y-2">
      <h1 className={`text-2xl font-bold ${textHeader.color}`}>
        {textHeader.text}
      </h1>

      {/* Phần nhập điểm và hiển thị thời gian */}
      <div>
        <div className="grid grid-cols-4 gap-2">
          <label htmlFor="points" className="block text-sm font-medium mb-1">
            Points:
          </label>
          <input
            id="points"
            type="number"
            className="col-span-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            min="1"
            max="10000"
            disabled={isPlaying}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <label htmlFor="time" className="block text-sm font-medium mb-1">
            Time:
          </label>
          <div className="col-span-2">{time.toFixed(1) + "s"}</div>
        </div>
      </div>

      {/* Nút điều khiển trò chơi */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={startGame}
          className="flex-1 rounded-md bg-slate-900 text-white py-3"
        >
          {isPlaying ? "Restart" : "Start"}
        </button>
        {isPlaying && (
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className="flex-1 border rounded-md border-gray-500 py-3"
          >
            Auto Play {autoPlay ? "ON" : "OFF"}
          </button>
        )}
      </div>

      {/* Khu vực chơi game chính */}
      <div className="relative aspect-square border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
        {circles.map((circle) => {
          const opacity =
            clickTimes[circle?.id] !== undefined
              ? clickTimes[circle?.id] / TIME_COUNT_DOWN
              : 1; // Calculate opacity based on remaining time

          return (
            <div
              key={circle?.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                clickTimes[circle?.id] === 0 ? "hidden" : ""
              }`}
              style={{
                left: `${circle.x}%`,
                top: `${circle.y}%`,
              }}
            >
              <button
                onClick={() => isPlaying && handleCircleClick(circle?.id)}
                className={`w-12 h-12 rounded-full border-2 text-xs
                ${getCircleStyle(circle?.id)}
                transition-all duration-300
                ${
                  isPlaying
                    ? "cursor-pointer hover:scale-110"
                    : "cursor-not-allowed opacity-50"
                } transition-opacity duration-${STEP_TIME_COUNT_DOWN} ease-in-out  `}
                style={{
                  opacity: opacity, // Apply calculated opacity
                }}
                disabled={!isPlaying}
                aria-label={`Circle ${circle?.id}`}
              >
                {circle?.id}
                {clickTimes[circle?.id] !== undefined && (
                  <div className="mt-1 text-xs text-black px-1 rounded">
                    {Number(clickTimes[circle?.id] / 1000).toFixed(1)}s
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Hiển thị số tiếp theo cần nhấp */}
      <div className="text-sm">Next: {nextNumber}</div>
    </div>
  );
}
export default Game;
