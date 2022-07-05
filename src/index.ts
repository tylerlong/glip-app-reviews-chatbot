import axios from 'axios';

const apiKey = process.env.BIRDEYE_API_KEY;
const businessId = process.env.BIRDEYE_BUSINESS_ID;

const main = async () => {
  // const r = await axios.get(
  //   `https://api.birdeye.com/resources/v1/business/search?api_key=${apiKey}`
  // );
  // console.log(JSON.stringify(r.data, null, 2));
  const date = new Date();
  date.setDate(date.getDate() - 2);
  console.log(date.toLocaleDateString());
  const r = await axios.post(
    `https://api.birdeye.com/resources/v1/review/businessId/${businessId}?api_key=${apiKey}`,
    {
      fromDate: date.toLocaleDateString(),
    }
  );
  console.log(JSON.stringify(r.data, null, 2));
};

main();
