import { useEffect } from 'react';

const usePageTitle = (title) => {
    useEffect(() => {
        document.title = `Administrador | ${title}`;
    }, [title]);
};

export default usePageTitle;
