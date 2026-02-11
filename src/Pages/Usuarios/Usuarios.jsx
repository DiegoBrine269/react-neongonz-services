
import defaultPhoto from '../../assets/default-profile-photo.jpg'
import { AppContext } from '@/context/AppContext';
import { useContext, useEffect, useState } from 'react';
import clienteAxios from '@/config/axios';
import { format } from '@formkit/tempo';
import Modal from '@/components/Modal';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function Usuarios() {

    const {setLoading, requestHeader, user} = useContext(AppContext);
    const [users, setUsers] = useState([]);
    const [modal, setModal] = useState(false);
    const [formData, setFormData] = useState({
        password:'',
        password_confirmation:''
    });
    const [selectedUser, setSelectedUser] = useState({});

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await clienteAxios.get("/api/admin/users", requestHeader);

            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
        finally{
            setLoading(false);
        }
    }

    const  handleChangePassword = async () => {
        try {
            console.log("Changing password for user ID:", selectedUser.id);
            await clienteAxios.post(
                `/api/admin/users/${selectedUser.id}/change-password`,
                formData,
                requestHeader
            );
            fetchUsers();
            toast.success("Contraseña cambiada correctamente");
            setModal(false);
        }
        catch (error) {
            console.error("Error changing password:", error);
            toast.error("Error al cambiar la contraseña");
        }
        finally{
            setLoading(false);
        }
    }

    const  handleChangeStatus = async (id, status) => {
        try {
            setLoading(true);
            console.log("Changing status for user ID:", id);
            await clienteAxios.post(
                `/api/admin/users/${id}/change-status`,
                {
                    is_active: status
                },
                requestHeader
            );
            fetchUsers();
            toast.success("Estatus del usuario actualizado correctamente");
        }
        catch (error) {
            console.error("Error changing status:", error);
            toast.error("Error al cambiar el estatus del usuario");
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchUsers();
    }, []);

    return (
        <div
            className='lg:w-2/3 mx-auto'
        >
            <h2 className='title-2'>Usuarios</h2>
                <div className="contenedor-botones">
                    <Link className="btn">Reportes de desempeño</Link>
                </div>
                {
                    users?.map(u => u.id !== user.id && u.role == 'user' && 
                        (
                            <div className="mt-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-sm">
                    
                                <div className="flex items-start gap-4">
                                    <img
                                        src={defaultPhoto}
                                        alt=""
                                        className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-200 dark:ring-neutral-600"
                                    />

                                    <div className='w-full'>

                                        <div className="flex-1">
                                            
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                {u.name} {u.last_name}
                                            </h3>

                                            <div className="mt-1 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                                <p>
                                                    <span className="font-medium">Estatus:</span>{" "}
                                                    {
                                                        u.is_active ?
                                                            <span className="inline-flex items-center gap-1 text-green-600">
                                                                ● Activo
                                                            </span>
                                                        :
                                                            <span className="inline-flex items-center gap-1 text-red-600">
                                                                ● Inactivo
                                                            </span>
                                                    }
                                                </p>

                                                <p>
                                                    <span className="font-medium">Miembro desde:</span>{" "}
                                                    {format(u.created_at, "DD/MM/YYYY")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <button 
                                                className="btn btn-outline !px-3 !py-1 text-sm"
                                                onClick={()=>{
                                                    setModal(true)
                                                    setSelectedUser(u)
                                                }}
                                            >
                                                Cambiar contraseña
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <hr className="my-4 border-slate-200 dark:border-neutral-700" />

                                <div className="flex justify-end">
                                    {u.is_active && 
                                        <button 
                                            onClick={()=>{
                                                handleChangeStatus(u.id, false)
                                            }}
                                            className="btn btn-danger" >
                                            Revocar permisos
                                        </button>
                                    }

                                    {!u.is_active && 
                                        <button 
                                            className="btn bg-green-500"
                                            onClick={()=>{
                                                handleChangeStatus(u.id, true)
                                            }}
                                        >
                                            Otorgar permisos
                                        </button>
                                    }

                                </div>
                            </div>
                        )
                    )

                }

                <Modal
                    isOpen={modal}
                    onClose={()=>setModal(false)}
                    title="Cambiar contraseña"
                >

                    <h3 className="title-3">Cambiar contraseña</h3>
                    <label className="label" htmlFor="password">Nueva contraseña</label>
                    <input
                        className="input"
                        autoFocus
                        type="password" 
                        placeholder="Nueva contraseña"
                        id="password"
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                    />

                    <label className="label" htmlFor="password_confirmation">Nueva contraseña</label>
                    <input
                        className="input"
                        type="password" 
                        placeholder="Confirma la nueva contraseña"
                        id="password_confirmation"
                        onChange={(e) =>
                            setFormData({ ...formData, password_confirmation: e.target.value })
                        }
                    />

                    <div className="contenedor-botones">
                        <button
                            className="btn btn-primary"
                            onClick={()=>handleChangePassword()}
                        >
                            Guardar cambios
                        </button>
                    </div>
                </Modal>

        </div>
    )
}
