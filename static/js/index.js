$(function(){
    var Self = {
        init:function(){
            Self.initEvent();
            Self.setActiveTab();
            Self.getGalleryList(); 
            
        },
        data_store:{
            listCount:4
        },
        initEvent:function(){
            $("#navbarCollapse .nav-item").off("click").on("click",function(e){
                var target = $(e.currentTarget).find(".nav-link").eq(0).attr("href").substr(1);
                if($(document).width()<768){
                    $(".navbar-toggler").trigger("click")
                }
                Self.setActiveTab(target);
                if(target=='gallery'){
                    setTimeout(function(){
                        $(".gallery_item").eq(0).trigger("click")
                    },500) 
                }
            });

            $("#create_model").off("click").on("click",function(){
                let formData = new FormData();
                formData.append('img', $("#model_image")[0].files[0])
                formData.append('video', $("#model_video")[0].files[0])
                formData.append('x3d', $("#model_x3d")[0].files[0])
                formData.append('texture', $("#model_texture")[0].files[0])
                formData.append('name', $("#model_name").val())
                formData.append('description', $("#model_des").val())
                $.ajax({
                    data:formData,
                    url:"public/museum/create",
                    type: 'post',
                    cache: false,
                    processData: false,
                    contentType: false,
                    success:function(res){
                        alert('Upload Success');
                        $('#newModel').modal('hide');
                        Self.getAdminData();
                        $('#model_name').val('')
                        $('#model_des').val('')
                        $('#model_image').val('')
                        $('#model_video').val('')
                        $('#model_x3d').val('')
                        $('#model_texture').val('')
                    },
                    error:function(err){
                        alert('Upload Failure');
                    }
                })
            })
            // edit model
            $("#edit_model").off("click").on("click",function(){
                
                Self.updateVase({
                    id:Self.data_store.update_id,
                    description:$("#new_model_des").val()
                })
            })

            $("#gallery_button_group button").off("click").on("click",function(e){
                $("#gallery_button_group button").removeClass("active");
                $(e.currentTarget).addClass("active");
                const id = e.currentTarget.id;
                if(id === 'spin') {
                    const spinStatus = localStorage.getItem('spin')
                    if(spinStatus === 'true') {
                        // stop the spin
                        document.getElementById('Vase__TIMER').setAttribute('enabled', 'false')
                        localStorage.setItem('spin', false);
                    } else {
                        document.getElementById('Vase__TIMER').setAttribute('enabled', 'true')
                        localStorage.setItem('spin', true);
                    }
                    
                } else if (id === 'wireframe') {
                    document.getElementById('Vase__TIMER').setAttribute('enabled', 'false')
                    var e = document.getElementsByTagName('x3d')[0];
                    e.runtime.togglePoints(true);
                } else if (id === 'texture') {
                    document.getElementById('Vase__TIMER').setAttribute('enabled', 'false')
                    const texture = document.getElementsByTagName('ImageTexture')[0].getAttribute('url');
                    if(texture[0] !== '') {
                        document.getElementsByTagName('ImageTexture')[0].setAttribute('url', '');
                    } else {
                        let url = localStorage.getItem('imgUrl');
                        url = url.split('static/')[1]
                        document.getElementsByTagName('ImageTexture')[0].setAttribute('url', '../' + url);
                    }
                } else if (id === 'camera1') {
                    document.getElementById('Vase__TIMER').setAttribute('enabled', 'false')
                    document.getElementById('Vase__frontCam').setAttribute('set_bind', 'true') 
                } else if (id === 'camera2') {
                    document.getElementById('Vase__TIMER').setAttribute('enabled', 'false')
                    document.getElementById('Vase__topCam').setAttribute('set_bind', 'true') 
                } else if (id === 'light') {
                    const lightStatus = localStorage.getItem('light');
                    const spotLights = document.getElementsByTagName('PointLight')
                    let flag;
                    if(lightStatus === 'on') {
                        // turn off the light
                        localStorage.setItem('light', 'off')
                        flag = 'false'
                    } else {
                        // turn on the light
                        localStorage.setItem('light', 'on')
                        flag = 'true'
                    }

                    for(let i = 0 ; i<spotLights.length; i++) {
                        spotLights[i].setAttribute('on', flag)
                    }
                }
            })
        },
        setActiveTab:function(name='home'){
            $("#navbarCollapse .nav-item").removeClass("active");
            $("main>.tab-pane").addClass("fade");
            $("#"+name).removeClass("fade");
            $(".nav-link[href='#"+name+"']").parent().addClass('active');
            if(name=='gallery'){
                Self.initGalleryPage();
                $('#tab_header div:first').tab('show')
            }else if(name=='admin'){
                Self.initAdminPage()
            }
            $(".top_icon").trigger("click");
            
        },
        getGalleryList:function(num=Self.data_store.listCount){
            $(".more_place").hide();
            $.ajax({
                url:"public/museum/findAll",
                dataType:'JSON',
                method:"get",
                success:function(res){
                    Self.renderDataToGalleryList(res)
                },
                error:function(err){
                    console.log(err)
                }
            })
        },
        renderDataToGalleryList:function(res){
            $("#home_gallery_list").empty();
            res.map((item,index)=>{
                if(index > Self.data_store.listCount - 1) return;
                $("#home_gallery_list").append(
                    `<div class='col-md-3 col-sm-6 col-xs-6 home_gallery_item align_center' data-id='${item.id}'>
                        <img src="${item.img}" alt="" class='w-100' style='height:40%' />
                        <div class=''>${item.name}</div>
                    </div>`
                )
            });
            $(".home_gallery_item").off("click").on("click",function(e){
                var id = $(e.currentTarget).attr("data-id");
                Self.getGalleryById(id);
            })
            $(".more_place").show();
            //if show more button
            if(res.length<=Self.data_store.listCount){
                $(".more_place").remove();
            }
            
        },
        getGalleryById:function(id){
            $.ajax({
                url:"public/museum/findOne/" + id,
                method:"get",
                dataType:'JSON',
                success:function(res){
                    localStorage.setItem('imgUrl', res.img);
                    localStorage.setItem('light', 'on');
                    localStorage.setItem('spin', false);
                    $("#gallery_button_group button").removeClass("active");
                    Self.renderDataToGallery(res)
                },
                error:function(err){
                    console.log(err)
                }
            })
        },
        renderDataToGallery:function(res){
            Self.setActiveTab("gallery");
            $("#3d_model").attr("url", res.x3d);
            $('#d3_text').html(res.description);
            $('#gallery_img').attr('src', res.img);
            $('#gallery_video').attr('src', res.video);
        },
        initGalleryPage:function(){
            $.ajax({
                url:"public/museum/findAll",
                dataType:"json",
                method:"get",
                success:function(res){
                    Self.renderDataToGalleryPage(res)
                },
                error:function(err){

                }
            })
            
        },
        renderDataToGalleryPage:function(data){
            $("#multiple_box").empty()
            $("#multiple_box").append('<div class="multiple-items"></div>')
            data.map((item,index)=>{
                $(".multiple-items").append(`<div><img class='gallery_item w-100' src='${item.img}' alt='' data_id='${item.id}'/></div>`)
            })
            $('.multiple-items').not('.slick-initialized').slick({
                dots: true,
                infinite: false,
                speed: 300,
                slidesToShow: 4,
                slidesToScroll: 4,
                responsive: [
                    {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: true,
                        arrows: true,
                    }
                    },
                    {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                    },
                    {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                    }
                    // You can unslick at a given breakpoint now by adding:
                    // settings: "unslick"
                    // instead of a settings object
                ]
            });

            $(".gallery_item").off("click").on("click",function(e){
                var id= $(e.currentTarget).attr("data_id");
                $.ajax({
                url:"public/museum/findOne/" + id,
                method:"get",
                dataType:'JSON',
                success:function(res){
                    localStorage.setItem('imgUrl', res.img);
                    localStorage.setItem('light', 'on');
                    localStorage.setItem('spin', false);
                    $("#gallery_button_group button").removeClass("active");
                    $("#3d_model").attr("url", res.x3d);
                    $('#d3_text').html(res.description);
                    $('#gallery_img').attr('src', res.img);
                    $('#gallery_video').attr('src', res.video);
                    
                },
                error:function(err){
                }
            })
            })
        },
        initAdminPage:function(){
            Self.getAdminData()
        },
        getAdminData:function(){
            $.ajax({
                url:"public/museum/findAll",
                method:"get",
                dataType:'JSON',
                success:function(res){
                    Self.renderAdminData(res)
                },
                error:function(err){
                    Self.renderAdminData({})

                    console.log(err)
                }
            })
        },
        renderAdminData:function(data){
            var dataTableOption = {
                dom: '<"top"<"pull-left"l><"pull-right"f><"pull-right create">>rt<"bottom"<"pull-left"i><"pull-right"p>><"clear">',
                iDisplayLength: 10,
                bAutoWidth: false,
                responsive: true,
                bSort: true,
                bFilterOnEnter: true,
                processing: false,
                searching:false,
                lengthChangeOption:false,
                info:false
              };

              dataTableOption.columns = [{
                  "data": "name",
                  "width": '10%',
                  render: function (data, type, full) {
                    return data
                  }
                },
                {
                  "data": "description",
                  "width": '80%',
                  render: function (data, type, full) {
                    return data
                  }
                },
                {
                  "data": "id",
                  "width": '10%',
                  render: function (data, type, full) {
                    return `<div data_id='${data}'>
                        <span class='update_admin border-right border-dark'>Update</span><span class='delete_admin'>Delete</span>
                    </div>`
                  }
                }
              ]
              dataTableOption.data = data;
              $("#admin_table").DataTable().destroy();
              $("#admin_table").DataTable(dataTableOption);
              $(".update_admin").off("click").on("click",function(e){
                var id=$(e.currentTarget).parent().attr("data_id")
                Self.data_store.update_id = id;
                $("#editModel").modal("show")
              });
              $(".delete_admin").off("click").on("click",function(e){
                var id=$(e.currentTarget).parent().attr("data_id")
                Self.deleteVase(id)
              })
        },
        updateVase:function(param){
            $.ajax({
                url:"public/museum/update",
                method:"post",
                dataType:'JSON',
                data: param,
                success:function(res){
                    $("#editModel").modal("hide")
                    $('#new_model_des').val('')
                    Self.getAdminData();
                },
                error:function(err){
                    Self.getAdminData();
                }
            })
        },
        deleteVase:function(id){
            $.ajax({
                url:"public/museum/delete",
                method:"post",
                data: {id: id},
                dataType:'JSON',
                success:function(res){
                    Self.getAdminData();
                },
                error:function(err){
                    Self.getAdminData();
                }
            })
        }

    };
    Self.init();
})