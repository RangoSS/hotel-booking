import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useEffect, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { auth, db, storage } from '../../firebase'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
const New = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const [data, setData] = useState({}) //emty object
  const [perc, SetPerc] = useState(null)
  useEffect(() => {
    const uploadFile = () => {

      const name = new Date().getTime() + file.name
      const storageRef = ref(storage, file.name); //storage reference
      console.log(name)
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          SetPerc(progress)
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
            default:
              break;//break the loop
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // console.log('File available at', downloadURL);

            setData(prev => ({ ...prev, img: downloadURL }));
          });
        }
      );

    }
    file && uploadFile() //che if the file is uploaded
  }, [file]);

  const handleInput = (e) => {
    e.preventDefault()
    const id = e.target.id;
    const value = e.target.value;

    //get properties of form
    setData({ ...data, [id]: value })  //three doots means previous data

  };
  console.log(data);
  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      //autheticating user
      const res = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      // Add a new document in collection "cities"
      //posting data to firebase
      await setDoc(doc(db, "users", res.user.uid), {
        data,//pass data from form and time
        Timestamp: serverTimestamp()
      });

    } catch (err) {
      console.log(err);
    }
  }
  //is a promise


  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={handleAdd}>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}//get the id of form
                    type={input.type}
                    placeholder={input.placeholder}
                    onChange={handleInput} />
                </div>
              ))}
              <button disabled={perc !== null && perc < 100} type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
