import React from 'react';

import * as Icons from "react-icons/bi";
import {SiDiscord, SiDocker, SiGithub, SiGoland, SiHeroku, SiKubernetes} from "react-icons/si";
import {TbBrandGolang, TbBrandTypescript} from "react-icons/tb";

/* Your icon name from database data can now be passed as prop */
const DynamicBiIcon = ({ name, size }) => {
    if(name === "kubernetes"){
      return <SiKubernetes size={size} />
    }
    if(name === "docker"){
      return <SiDocker size={size} />
    }
    if(name === "heroku"){
        return <SiHeroku size={size} />
    }
    if(name === "github"){
      return <SiGithub size={size} />
    }
    if(name === "discord"){
      return <SiDiscord size={size} />
    }
    if(name === "golang"){
      return <TbBrandGolang size={size} />
    }
    if(name === "typescript"){
      return <TbBrandTypescript size={size} />
    }
  
    const IconComponent = Icons[name];
  
    if (!IconComponent) { // Return a default one
      return <Icons.BiAbacus size={size} />;
    }
  
    return <IconComponent size={size} />;
  };

  export default DynamicBiIcon;