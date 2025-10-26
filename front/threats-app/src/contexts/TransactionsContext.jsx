import React, { createContext, useState, useEffect, useMemo } from "react";

export const TransactionsContext = createContext();

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [last12Hours, setLast12Hours] = useState([]);
  const [last2Hours, setLast2Hours] = useState([]);
  const [lastHour, setLastHour] = useState([]);
  const [last30Minutes, setLast30Minutes] = useState([]);

  // Helpers to keep rolling windows accurate
  // Robustly get timestamp (ms) from a transaction
  const getTxTimeMs = (t) => {
    try {
      // Prefer ISO-like combine of date + time
      if (t?.trans_date && t?.trans_time) {
        let time = String(t.trans_time);
        // If HH:MM, add seconds
        if (/^\d{2}:\d{2}$/.test(time)) time += ":00";
        const iso = `${t.trans_date}T${time}`; // YYYY-MM-DDTHH:mm[:ss]
        const d = new Date(iso);
        if (!isNaN(d.getTime())) return d.getTime();
      }
      // created_at as ISO
      if (t?.created_at) {
        const d = new Date(t.created_at);
        if (!isNaN(d.getTime())) return d.getTime();
      }
      // numeric epoch seconds or ms
      if (t?.timestamp != null) {
        const num = Number(t.timestamp);
        if (!Number.isNaN(num)) return num < 1e12 ? num * 1000 : num;
      }
      if (t?.ts != null) {
        const num = Number(t.ts);
        if (!Number.isNaN(num)) return num < 1e12 ? num * 1000 : num;
      }
      return null;
    } catch {
      return null;
    }
  };

  const withinWindow = (t, ms) => {
    const when = getTxTimeMs(t);
    // If we can't parse, keep it (don't accidentally drop data)
    if (when == null) return true;
    return Date.now() - when <= ms;
  };

  // Fetch last 12 hours of transactions
  useEffect(() => {
    const fetchLast12Hours = async () => {
      try {
        const res = await fetch(
          "https://winning-threat-production.up.railway.app/time_period_inputs?minutes=720"
        );

        if (!res.ok) {
          console.warn("Response not OK:", res.status);
          return;
        }

        const data = await res.json();

        if (data.success && data.transactions) {
          // Transform the data structure from {transaction: {...}, ml_prediction: ...} to flat objects
          const transformedTransactions = data.transactions.map((item) => ({
            ...item.transaction,
            ml_prediction: item.ml_prediction,
          }));

          setLast12Hours(transformedTransactions);
          console.log(
            `Loaded ${transformedTransactions.length} transactions from last 12 hours`
          );
        }
      } catch (err) {
        console.error("Error fetching 12-hour transactions:", err);
      }
    };

    // Fetch immediately
    fetchLast12Hours();

    // Refresh every 2 minutes
    const interval = setInterval(fetchLast12Hours, 120000);

    return () => clearInterval(interval);
  }, []);

  // Fetch last 2 hours of transactions (for real-time threat monitoring)
  useEffect(() => {
    const fetchLast2Hours = async () => {
      try {
        const res = await fetch(
          "https://winning-threat-production.up.railway.app/time_period_inputs?minutes=120"
        );

        if (!res.ok) {
          console.warn("Response not OK:", res.status);
          return;
        }

        const data = await res.json();

        if (data.success && data.transactions) {
          // Transform the data structure
          const transformedTransactions = data.transactions.map((item) => ({
            ...item.transaction,
            ml_prediction: item.ml_prediction,
          }));

          setLast2Hours(transformedTransactions);
          console.log(
            `Loaded ${transformedTransactions.length} transactions from last 2 hours`
          );
        }
      } catch (err) {
        console.error("Error fetching 2-hour transactions:", err);
      }
    };

    // Fetch immediately
    fetchLast2Hours();

    // Refresh every 30 seconds for more real-time updates
    const interval = setInterval(fetchLast2Hours, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch last hour of transactions (for patterns analysis)
  useEffect(() => {
    const fetchLastHour = async () => {
      try {
        const res = await fetch(
          "https://winning-threat-production.up.railway.app/time_period_inputs?minutes=60"
        );

        if (!res.ok) {
          console.warn("Response not OK:", res.status);
          return;
        }

        const data = await res.json();

        if (data.success && data.transactions) {
          // Transform the data structure
          const transformedTransactions = data.transactions.map((item) => ({
            ...item.transaction,
            ml_prediction: item.ml_prediction,
          }));

          setLastHour(transformedTransactions);
          console.log(
            `Loaded ${transformedTransactions.length} transactions from last hour`
          );
        }
      } catch (err) {
        console.error("Error fetching last-hour transactions:", err);
      }
    };

    // Fetch immediately
    fetchLastHour();

    // Refresh every 20 seconds for real-time pattern analysis
    const interval = setInterval(fetchLastHour, 20000);

    return () => clearInterval(interval);
  }, []);

  // Fetch last 30 minutes of transactions (for map visualization)
  useEffect(() => {
    const fetchLast30Minutes = async () => {
      try {
        const res = await fetch(
          "https://winning-threat-production.up.railway.app/time_period_inputs?minutes=30"
        );

        if (!res.ok) {
          console.warn("Response not OK:", res.status);
          return;
        }

        const data = await res.json();

        if (data.success && data.transactions) {
          // Transform the data structure
          const transformedTransactions = data.transactions.map((item) => ({
            ...item.transaction,
            ml_prediction: item.ml_prediction,
          }));

          setLast30Minutes(transformedTransactions);
          console.log(
            `Loaded ${transformedTransactions.length} transactions from last 30 minutes`
          );
        }
      } catch (err) {
        console.error("Error fetching last 30 minutes transactions:", err);
      }
    };

    // Fetch immediately
    fetchLast30Minutes();

    // Refresh every 15 seconds for map updates
    const interval = setInterval(fetchLast30Minutes, 15000);

    return () => clearInterval(interval);
  }, []);

  // Keep the old real-time single transaction fetch for backward compatibility
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await fetch(
          "https://winning-threat-production.up.railway.app/last_transaction"
        );

        if (!res.ok) {
          console.warn("Response not OK:", res.status);
          return;
        }

        const data = await res.json();
        // data = { transaction: {...}, ml_prediction: ... }

        // build the shape we keep in state
        const newTx = {
          ...data.transaction,
          ml_prediction: data.ml_prediction,
        };

        // sanity check
        if (
          !newTx ||
          !newTx.transaction_id // must have id
        ) {
          console.warn("No valid transaction in response:", data);
          return;
        }

        console.log("received transaction");

        setTransactions((prev) => {
          const last = prev[prev.length - 1];

          // append only if it's new (ID changed)
          if (
            !last ||
            String(last.transaction_id) !== String(newTx.transaction_id)
          ) {
            const updated = [...prev, newTx];
            console.log("Added new transaction:", newTx);

            // Update rolling arrays immediately (no pruning; trust server polls to window)
            setLast12Hours((prev12) => {
              const exists = prev12.some(
                (t) => String(t.transaction_id) === String(newTx.transaction_id)
              );
              return exists ? prev12 : [...prev12, newTx];
            });

            setLast2Hours((prev2) => {
              const exists = prev2.some(
                (t) => String(t.transaction_id) === String(newTx.transaction_id)
              );
              return exists ? prev2 : [...prev2, newTx];
            });

            setLastHour((prev1) => {
              const exists = prev1.some(
                (t) => String(t.transaction_id) === String(newTx.transaction_id)
              );
              return exists ? prev1 : [...prev1, newTx];
            });

            setLast30Minutes((prev30) => {
              const exists = prev30.some(
                (t) => String(t.transaction_id) === String(newTx.transaction_id)
              );
              return exists ? prev30 : [...prev30, newTx];
            });

            return updated;
          }

          // else keep same list
          return prev;
        });
      } catch (err) {
        console.error("Error fetching transaction:", err);
      }
    };

    // first fetch immediately
    fetchTransaction();

    // then poll every 1s
    const interval = setInterval(fetchTransaction, 1000);

    return () => clearInterval(interval);
  }, []);

  // Compute statistics
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;

    const fraudCount = transactions.filter(
      (t) =>
        t.ml_prediction === true ||
        t.ml_prediction === 1 ||
        t.ml_prediction === "1"
    ).length;

    const legitimateCount = totalTransactions - fraudCount;
    const fraudRate =
      totalTransactions > 0 ? (fraudCount / totalTransactions) * 100 : 0;

    const totalAmount = transactions.reduce(
      (sum, t) => sum + parseFloat(t.amt || 0),
      0
    );
    const avgAmount =
      totalTransactions > 0 ? totalAmount / totalTransactions : 0;

    return {
      totalTransactions,
      fraudCount,
      legitimateCount,
      fraudRate,
      totalAmount,
      avgAmount,
    };
  }, [transactions]);

  // Stats for last 2 hours
  const last2HoursStats = useMemo(() => {
    const arr = Array.isArray(last2Hours) ? last2Hours : [];
    const totalTransactions = arr.length;
    const fraudCount = arr.filter(
      (t) =>
        t?.ml_prediction === true ||
        t?.ml_prediction === 1 ||
        t?.ml_prediction === "1"
    ).length;
    const legitimateCount = totalTransactions - fraudCount;
    const fraudRate =
      totalTransactions > 0 ? (fraudCount / totalTransactions) * 100 : 0;
    const totalAmount = arr.reduce(
      (sum, t) => sum + parseFloat(t?.amt || 0),
      0
    );
    const avgAmount =
      totalTransactions > 0 ? totalAmount / totalTransactions : 0;
    return {
      totalTransactions,
      fraudCount,
      legitimateCount,
      fraudRate,
      totalAmount,
      avgAmount,
    };
  }, [last2Hours]);

  // Stats for last 12 hours
  const last12HoursStats = useMemo(() => {
    const arr = Array.isArray(last12Hours) ? last12Hours : [];
    const totalTransactions = arr.length;
    const fraudCount = arr.filter(
      (t) =>
        t?.ml_prediction === true ||
        t?.ml_prediction === 1 ||
        t?.ml_prediction === "1"
    ).length;
    const legitimateCount = totalTransactions - fraudCount;
    const fraudRate =
      totalTransactions > 0 ? (fraudCount / totalTransactions) * 100 : 0;
    const totalAmount = arr.reduce(
      (sum, t) => sum + parseFloat(t?.amt || 0),
      0
    );
    const avgAmount =
      totalTransactions > 0 ? totalAmount / totalTransactions : 0;
    return {
      totalTransactions,
      fraudCount,
      legitimateCount,
      fraudRate,
      totalAmount,
      avgAmount,
    };
  }, [last12Hours]);

  // Stats for last hour
  const lastHourStats = useMemo(() => {
    const arr = Array.isArray(lastHour) ? lastHour : [];
    const totalTransactions = arr.length;
    const fraudTransactions = arr.filter(
      (t) =>
        t?.ml_prediction === true ||
        t?.ml_prediction === 1 ||
        t?.ml_prediction === "1"
    );
    const fraudCount = fraudTransactions.length;
    const legitimateCount = totalTransactions - fraudCount;
    const fraudRate =
      totalTransactions > 0 ? (fraudCount / totalTransactions) * 100 : 0;
    const totalAmount = arr.reduce(
      (sum, t) => sum + parseFloat(t?.amt || 0),
      0
    );
    const avgAmount =
      totalTransactions > 0 ? totalAmount / totalTransactions : 0;

    // Analyze FRAUD patterns only
    // Pattern 1: Top fraud merchants
    const fraudMerchants = {};
    fraudTransactions.forEach((t) => {
      const merchant = t?.merchant?.replace("fraud_", "") || "Unknown";
      fraudMerchants[merchant] = (fraudMerchants[merchant] || 0) + 1;
    });
    const topFraudMerchant = Object.entries(fraudMerchants).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Pattern 2: Top fraud categories
    const fraudCategories = {};
    fraudTransactions.forEach((t) => {
      const category = t?.category || "Unknown";
      fraudCategories[category] = (fraudCategories[category] || 0) + 1;
    });
    const topFraudCategory = Object.entries(fraudCategories).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Pattern 3: High-risk age groups (for fraud)
    const fraudAgeGroups = {
      "18-30": 0,
      "31-45": 0,
      "46-60": 0,
      "60+": 0,
    };
    fraudTransactions.forEach((t) => {
      const dob = t?.dob ? new Date(t.dob) : null;
      if (dob && !isNaN(dob.getTime())) {
        const age = Math.floor(
          (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        if (age >= 18 && age <= 30) fraudAgeGroups["18-30"]++;
        else if (age >= 31 && age <= 45) fraudAgeGroups["31-45"]++;
        else if (age >= 46 && age <= 60) fraudAgeGroups["46-60"]++;
        else if (age > 60) fraudAgeGroups["60+"]++;
      }
    });
    const highRiskAge = Object.entries(fraudAgeGroups).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Pattern 4: High-risk states for fraud
    const fraudStates = {};
    fraudTransactions.forEach((t) => {
      const state = t?.state || "Unknown";
      fraudStates[state] = (fraudStates[state] || 0) + 1;
    });
    const topFraudState = Object.entries(fraudStates).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Pattern 5: Average fraud transaction amount vs legitimate
    const fraudAmount = fraudTransactions.reduce(
      (sum, t) => sum + parseFloat(t?.amt || 0),
      0
    );
    const avgFraudAmount = fraudCount > 0 ? fraudAmount / fraudCount : 0;

    return {
      totalTransactions,
      fraudCount,
      legitimateCount,
      fraudRate,
      totalAmount,
      avgAmount,
      // Top 5 fraud patterns
      topFraudMerchant: topFraudMerchant ? topFraudMerchant[0] : "N/A",
      topFraudMerchantCount: topFraudMerchant ? topFraudMerchant[1] : 0,
      topFraudCategory: topFraudCategory ? topFraudCategory[0] : "N/A",
      topFraudCategoryCount: topFraudCategory ? topFraudCategory[1] : 0,
      highRiskAge: highRiskAge ? highRiskAge[0] : "N/A",
      highRiskAgeCount: highRiskAge ? highRiskAge[1] : 0,
      topFraudState: topFraudState ? topFraudState[0] : "N/A",
      topFraudStateCount: topFraudState ? topFraudState[1] : 0,
      avgFraudAmount,
    };
  }, [lastHour]);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        setTransactions,
        stats,
        last12Hours,
        last12HoursStats,
        last2Hours,
        last2HoursStats,
        lastHour,
        lastHourStats,
        last30Minutes,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};
