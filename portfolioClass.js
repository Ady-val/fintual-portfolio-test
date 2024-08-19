class Price {
  constructor(date, price) {
      this.setDate(date);
      this.setPrice(price);
  }

  getDate() {
      return this.date;
  }

  getPrice() {
      return this.price;
  }

  setDate(date) {
      if (!this.isValidDate(date)) {
          throw new Error('La fecha no es válida. Debe estar en formato "yyyy-mm-dd" y ser una fecha existente.');
      }
      this.date = date;
  }

  setPrice(price) {
      if (typeof price !== 'number' || price < 0) {
          throw new Error('El precio debe ser un número positivo.');
      }
      this.price = price;
  }

  isValidDate(date) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(date)) {
          return false;
      }

      const parsedDate = new Date(date);
      const [year, month, day] = date.split('-').map(Number);

      return (
          parsedDate.getFullYear() === year &&
          parsedDate.getMonth() + 1 === month &&
          parsedDate.getDate() === day
      );
  }
}

class Stock {
  constructor(name, prices) {
      this.name = name;
      this.prices = this.FormatPrices(prices);
  }

  FormatPrices(prices) {
    if (prices.length === 0) {
      return [];
    }

    const formattedPrices = prices.map(priceObj => new Price(priceObj.date, priceObj.price));
    return formattedPrices.sort((a, b) => a.getDate().localeCompare(b.getDate()));
  }

  Price(date) {
    const price = this.prices.find(priceObj => priceObj.getDate() === date);
    return price ? price.getPrice() : null;
  }

  addPrice(date, price) {
    const newPrice = new Price(date, price);
    this.prices.push(newPrice);
    this.sortPrices();
  }

  sortPrices() {
    this.prices.sort((a, b) => a.getDate().localeCompare(b.getDate()));
  }

  getPrices() {
    return this.prices.map(priceObj => ({ date: priceObj.getDate(), price: priceObj.getPrice() }));
  }
}

class Portfolio {
  constructor() {
    this.stocks = [];
  }

  AddStock(name, prices) {
      const newStock = new Stock(name, prices);
      this.stocks.push(newStock);
      this.sortStocksByFirstDate();
  }

  Profit(startDate, endDate) {
    let totalProfit = 0;
    let startValue = 0;
    let endValue = 0;

    this.stocks.forEach(stock => {
      const startPrice = stock.Price(startDate);
      const endPrice = stock.Price(endDate);

      if (startPrice !== null && endPrice !== null) {
        startValue += startPrice;
        endValue += endPrice;
        totalProfit += endPrice - startPrice;
      } else {
        console.warn(`Precio no disponible para el stock ${stock.name} en las fechas especificadas.`);
      }
    });

    const years = this.calculateYearsBetweenDates(startDate, endDate);
    const annualizedReturn = years > 0 ? (Math.pow(endValue / startValue, 1 / years) - 1) : 0;

    return { totalProfit, annualizedReturn };
  }

  sortStocksByFirstDate() {
    this.stocks.sort((a, b) => {
      const firstDateA = a.getPrices()[0].date;
      const firstDateB = b.getPrices()[0].date;

      return firstDateA.localeCompare(firstDateB);
    });
  }

  calculateYearsBetweenDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end.getTime() - start.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return daysDifference / 365;
  }
}

// Ejemplo de uso
const stock1 = new Stock('AAPL', [
  { date: '2024-08-01', price: 180 },
  { date: '2024-01-01', price: 150 }
]);

// Añadir un nuevo precio al stock
stock1.addPrice('2024-05-01', 160);

const portfolio = new Portfolio([stock1]);

const result = portfolio.Profit('2024-01-01', '2024-08-01');
console.log(`La ganancia total del portafolio es: $${result.totalProfit}`);
console.log(`El retorno anualizado del portafolio es: ${(result.annualizedReturn * 100).toFixed(2)}%`);
