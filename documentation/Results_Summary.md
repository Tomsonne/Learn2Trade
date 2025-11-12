# SkillVest – Results Summary & Lessons Learned

## Results Summary

### Overview  
SkillVest is an educational trading simulator designed to help users understand algorithmic trading through real market data, interactive charts, and guided strategies.

### MVP Core Functionalities  
- Live crypto price visualization (BTC/USD, ETH/USD) via **Binance API**  
- User account system with secure authentication  
- Two automated trading strategies: **Moving Average Crossover (20/50)** and **RSI-based strategy**  
- Interactive dashboard displaying **performance metrics** and **trade history**  
- Educational mode emphasizing understanding over profit  

### Outcomes vs. Initial Objectives  

| Objective | Outcome |
|------------|----------|
| Build a full-stack trading simulator using real-time data | ✅ Achieved – fully functional React + Express + PostgreSQL stack |
| Implement at least 2 automated trading strategies | ✅ Achieved – MA Crossover and RSI integrated |
| Provide a clear, intuitive user interface | ✅ Positive feedback from test users |
| Include backend caching and data validation | ✅ Implemented Redis-like in-memory caching |
| Integrate market data API | ⚠️ Challenge resolved – switched from CoinGecko to Binance for better OHLC data |
| Deliver project within 14 November | ✅ Delivered on schedule |

### Key Metrics  
- **Data refresh rate:** ~60 seconds average (optimized caching)  
- **API response time:** ~120 ms average  
- **Frontend build speed:** <1s with Vite  
- **Uptime during demo:** 100%  

---

## Lessons Learned

### What Went Well  
- **Team collaboration:** Daily stand-ups and Trello task tracking ensured smooth coordination  
- **API migration success:** Moving from CoinGecko to Binance improved chart accuracy and reliability  
- **UI/UX feedback loop:** Early user testing led to clearer visual indicators and better strategy toggles  

### Challenges Faced  
- **Data synchronization:** Handling multiple timezones and OHLC aggregation was initially inconsistent; fixed by aligning all timestamps to UTC  
- **API limits:** Rate-limiting issues required implementing request caching and data persistence  
- **Balancing realism vs. simplicity:** The team prioritized educational clarity over complex trading logic  

### Areas for Improvement  
- **Earlier API testing:** Conducting API performance tests during planning would have saved rework time  
- **Extended QA phase:** Allocate more time for edge-case testing and load simulation  
- **Enhanced analytics:** Future versions could include ROI tracking and user performance dashboards  

---

## Conclusion  
SkillVest successfully met its educational and technical objectives.  
It demonstrates how algorithmic trading concepts can be made accessible through thoughtful UX, real data integration, and teamwork.  
Future iterations can build on this foundation to include social learning, gamification, and more advanced analytics.
