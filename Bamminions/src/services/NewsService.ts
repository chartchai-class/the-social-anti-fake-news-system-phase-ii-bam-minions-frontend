import AxiosClient from "@/services/AxiosCLient"; 
import { type News } from "@/types"; 
import type { AxiosResponse } from "axios";


function getNews(): Promise<AxiosResponse<News[]>> {
    return AxiosClient.get<News[]>('/news'); 
}

export default {
    getNews
};