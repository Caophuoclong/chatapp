import axios from "axios"
import queryString from "query-string";
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const axiosClient = axios.create({
    baseURL: SERVER_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Access-Control-Allow-Origin": "*",
    },
    paramsSerializer: (params) => queryString.stringify(params),
});
axiosClient.interceptors.request.use(config =>{
    if(config){
        if(config.headers){
            config.headers.Authorization = "Bearer " + localStorage.getItem("access_token");
            config.headers.AcceptAllowOrigin = "*";
        }
    }
    return config;
})
axiosClient.interceptors.response.use(response =>response, error=>{
    console.log(error);
    if(error.response.status === 401 && error.response.data.message === "Unauthorized"){
        localStorage.removeItem("access_token");
        window.location.href = "/login";
    }else{
        throw error;
    }
})
export default axiosClient; 