// Nigerian States and LGAs data
export const NIGERIAN_STATES = [
    { value: 'Abia', label: 'Abia' },
    { value: 'Adamawa', label: 'Adamawa' },
    { value: 'Akwa Ibom', label: 'Akwa Ibom' },
    { value: 'Anambra', label: 'Anambra' },
    { value: 'Bauchi', label: 'Bauchi' },
    { value: 'Bayelsa', label: 'Bayelsa' },
    { value: 'Benue', label: 'Benue' },
    { value: 'Borno', label: 'Borno' },
    { value: 'Cross River', label: 'Cross River' },
    { value: 'Delta', label: 'Delta' },
    { value: 'Ebonyi', label: 'Ebonyi' },
    { value: 'Edo', label: 'Edo' },
    { value: 'Ekiti', label: 'Ekiti' },
    { value: 'Enugu', label: 'Enugu' },
    { value: 'FCT', label: 'Federal Capital Territory' },
    { value: 'Gombe', label: 'Gombe' },
    { value: 'Imo', label: 'Imo' },
    { value: 'Jigawa', label: 'Jigawa' },
    { value: 'Kaduna', label: 'Kaduna' },
    { value: 'Kano', label: 'Kano' },
    { value: 'Katsina', label: 'Katsina' },
    { value: 'Kebbi', label: 'Kebbi' },
    { value: 'Kogi', label: 'Kogi' },
    { value: 'Kwara', label: 'Kwara' },
    { value: 'Lagos', label: 'Lagos' },
    { value: 'Nasarawa', label: 'Nasarawa' },
    { value: 'Niger', label: 'Niger' },
    { value: 'Ogun', label: 'Ogun' },
    { value: 'Ondo', label: 'Ondo' },
    { value: 'Osun', label: 'Osun' },
    { value: 'Oyo', label: 'Oyo' },
    { value: 'Plateau', label: 'Plateau' },
    { value: 'Rivers', label: 'Rivers' },
    { value: 'Sokoto', label: 'Sokoto' },
    { value: 'Taraba', label: 'Taraba' },
    { value: 'Yobe', label: 'Yobe' },
    { value: 'Zamfara', label: 'Zamfara' },
];

export const STATE_LGAS: Record<string, string[]> = {
    'Lagos': ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
    'Oyo': ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'],
    'Abia': ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'],
    'FCT': ['Abaji', 'Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'],
    'Kano': ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
    'Rivers': ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
    // Add more states with their LGAs as needed
    'Adamawa': ['Demsa', 'Fufure', 'Ganye', 'Gayuk', 'Gombi', 'Grie', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
    'Akwa Ibom': ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'],
    'Anambra': ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
};

export function getLGAsForState(state: string): string[] {
    return STATE_LGAS[state] || [];
}
