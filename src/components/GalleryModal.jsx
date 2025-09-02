import {Modal,View,TouchableOpacity,Image,Text} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GalleryModal=({images,isGalleryModalVisible,setIsGalleryModalVisible,handleImageClick})=>{

    return (<Modal 
            visible={isGalleryModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
                            setIsGalleryModalVisible(false);
                            }}>
            <View 
                style={{ width:'100%',
                        height:'100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center'
                        }}>
                <View style={{width:'95%',backgroundColor:'white', padding:10, borderRadius:12}}>
                    <ScrollView contentContainerStyle={{alignItems:'center',width:'100%',marginBottom:10, position:'relative'}}>
                        <TouchableOpacity style={{position:'absolute', top:5, right:5}} onPress={() => {
                            setIsGalleryModalVisible(false);
                            }}>
                            <Ionicons name="close" size={24} color={'black'} />
                        </TouchableOpacity>
                        <Text style={{fontSize:18, fontWeight:500, marginBottom:10}}>Gallery</Text>
                        <View style={{flexDirection:'row',flexWrap:'wrap',gap:10, width:'100%', justifyContent:'center'}}>
                        {images?.map((i) => (
                        <TouchableOpacity
                            onPress={() => handleImageClick(i)}
                            style={{
                            marginRight: 12,
                            }}
                            key={i}
                        >
                            <Image
                            source={{ uri: i }}
                            style={{ width: 150, height: 150, borderRadius: 10 }}
                            />
                        </TouchableOpacity>
                        ))}
                        </View>
                    </ScrollView>
                </View>
                

            </View>
            </Modal>)
}

export default GalleryModal;