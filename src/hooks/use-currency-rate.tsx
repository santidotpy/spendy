import { useEffect, useState } from "react";

export function useDollarRate() {
  const [rate, setRate] = useState<number | undefined>(undefined);
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://dolarapi.com/v1/dolares/oficial');
        const data = await res.json();
        setRate(data.venta);
      } catch (e) {
        console.error("Error obteniendo el valor del dólar:", e);
        setRate(1);
      }
    };

    fetchRate();
  }, []);

  return rate;
}
