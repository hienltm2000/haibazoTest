import React, { useCallback, useEffect, useRef, useState } from "react";
const textGameHeader = {
  // information game header
  default: "LET'S PLAY",
  end: "ALL CLEARED",
  missed: "GAME OVER",
};

const colorHeader = {
  // color text header
  default: "text-black",
  end: "text-green-600",
  missed: "text-orange-600",
};

const TIME_COUNT_DOWN = 3000; // time circle count down
const STEP_TIME_COUNT_DOWN = 100; //time for each times down
const TIME_DELAY_COUNT = 50; // time delay to action function count down
function Game() {
  //ref
  const clickCircleRef = useRef({}); // list circle that has been click
  const timersRef = useRef({}); //time count down for each circle
  // state game
  const [textHeader, setTextHeader] = useState({
    // body header game
    text: textGameHeader.default,
    color: colorHeader.default,
  });
  const [isGameInit, setIsGameInit] = useState(false);
  const [points, setPoints] = useState(5); // Number of points (circles)
  const [time, setTime] = useState(0); // Elapsed time
  const [isPlaying, setIsPlaying] = useState(false); // Playing state
  const [autoPlay, setAutoPlay] = useState(false); // Auto Mode
  const [nextNumber, setNextNumber] = useState(1); // next number to click
  const [circles, setCircles] = useState([]); // Array containing circle information
  const [clickedNumbers, setClickedNumbers] = useState([]); // Numbers that have been clicked
  const [clickTimes, setClickTimes] = useState({}); // Click time for each circle

  useEffect(() => {
    return () => {
      setIsGameInit(false);
    };
  }, []);

  // function random postion circle
  const MIN_DISTANCE_PERCENT = 8; // Ensure a minimum distance between circles
  const MAX_ATTEMPTS = 10; // Limit the number of attempts to place a circle to improve performance

  const isFarEnough = (x, y, circles, minDistance) => {
    // Only calculate with the 5 last circles
    return circles.slice(-5).every((circle) => {
      const distance = Math.sqrt(
        Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2)
      );
      return distance >= minDistance;
    });
  };

  const generateCircles = useCallback(() => {
    const newCircles = [];
    for (let i = points; i >= 1; i--) {
      let x, y;
      let attempts = 0;

      do {
        x = Math.random() * 90 + 5; // Random position from 5% to 95%;
        y = Math.random() * 90 + 5;
        attempts++;
      } while (
        attempts < MAX_ATTEMPTS &&
        !isFarEnough(x, y, newCircles, MIN_DISTANCE_PERCENT)
      );

      newCircles.push({ id: i, x, y });
    }

    setCircles(newCircles);
  }, [points]);

  // function start game
  const startGame = useCallback(() => {
    !isGameInit && setIsGameInit(true);
    clickCircleRef.current = {};
    setTime(0);
    setNextNumber(1);
    setClickedNumbers([]);
    setClickTimes({});
    setIsPlaying(true);
    setAutoPlay(false);
    generateCircles();
    setTextHeader({
      text: textGameHeader.default,
      color: colorHeader.default,
    });
  }, [generateCircles, isGameInit]);

  // handle to click a circle
  const handleCircleClick = useCallback(
    (id) => {
      if (!clickCircleRef.current[id]) {
        clickCircleRef.current = { ...clickCircleRef.current, [id]: id };
        setClickedNumbers((prev) => [...prev, id]);
        setClickTimes((prev) => ({ ...prev, [id]: TIME_COUNT_DOWN })); // Start countdown from TIME_COUNT_DOWN ms
        if (id === nextNumber) {
          if (nextNumber === points) {
            const TIME_END =
              TIME_DELAY_COUNT * (TIME_COUNT_DOWN / STEP_TIME_COUNT_DOWN + 6); //time from click to hidden circle
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
      }
    },
    [nextNumber, points]
  );

  // manage the overall timing of the game
  useEffect(() => {
    const STEP_TIME = 100;
    if (isPlaying) {
      const interval = setInterval(() => {
        setTime((prev) => parseFloat((prev + 0.1).toFixed(1)));
      }, STEP_TIME);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  // Time count down for each circle
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
          }, TIME_DELAY_COUNT);
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

  // Effect auto play ON
  useEffect(() => {
    let timeout;
    if (autoPlay && isPlaying) {
      timeout = setTimeout(() => {
        handleCircleClick(nextNumber);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [autoPlay, isPlaying, nextNumber, handleCircleClick]);

  // determine the style for each circle by status
  const getCircleStyle = (id) => {
    if (clickedNumbers.includes(id)) {
      return "border-red-500 bg-red-500 text-white"; // khi nhấp
    }
    return "border-gray-800 bg-white text-gray-800"; // khi chưa nhấp
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 space-y-2">
      <h1 className={`text-2xl font-bold ${textHeader.color}`}>
        {textHeader.text}
      </h1>

      {/* Input points and show time play */}
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
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <label htmlFor="time" className="block text-sm font-medium mb-1">
            Time:
          </label>
          <div className="col-span-2">{time.toFixed(1) + "s"}</div>
        </div>
      </div>

      {/* buttons control game */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={startGame}
          className="flex-1 rounded-md bg-slate-900 text-white py-3"
        >
          {isGameInit ? "Restart" : "Play"}
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

      {/* Main area playing game */}
      <div className="relative aspect-square border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
        {circles.map((circle) => {
          const opacity =
            clickTimes[circle?.id] !== undefined
              ? clickTimes[circle?.id] / TIME_COUNT_DOWN
              : 1; // opacity depend on time count down

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
                ${
                  isPlaying
                    ? "cursor-pointer hover:scale-110"
                    : "cursor-not-allowed opacity-50"
                } transition-opacity duration-${
                  TIME_DELAY_COUNT *
                  (TIME_COUNT_DOWN / STEP_TIME_COUNT_DOWN + 6) //time from click to hidden circle
                } ease-in-out  `}
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

      {/* Show the next number to click */}
      {isPlaying && <div className="text-sm">Next: {nextNumber}</div>}
    </div>
  );
}
export default Game;
