import create from 'zustand';
const useStore = create((set) => ({
usuario: '',
rol: '',
Id_Empleado:'',
Id_Usuario:'',
Id_rol:'',
Nombre_departamento:'',
Id_departamento:'',

setUsuarioo: (usuario) => set({ usuario }),
setRol: (rol) => set({ rol }),
setIdEmpleado:(Id_Empleado)=> set({ Id_Empleado}),
setIdUsuario:(Id_usuario)=> set({ Id_usuario}),
setIdrol:(Id_rol)=> set({ Id_rol}),
setNombreDepartamento:(Nombre_departamento)=> set({ Nombre_departamento}),
setIdDepartamento:(Id_departamento)=> set({ Id_departamento}),

}));
export default useStore;