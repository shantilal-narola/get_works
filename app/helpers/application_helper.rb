module ApplicationHelper
	def bootstrap_class_for flash_type
	    { success: "alert-success", error: "alert-danger", alert: "alert-warning", notice: "alert-info" }[flash_type] || flash_type.to_s
	end

	def show_link(href)
		link_to(href) do 
			content_tag(:i , "" , class: "fa fa-eye").html_safe
		end
	end

	def edit_link(href)
		link_to (href) do 
			content_tag(:i , "" , class: "fa fa-pencil").html_safe
		end
	end


	def delete_link(href)
		link_to(href , :method => :delete , data:{:confirm => "Are you sure ?"} ) do 
			content_tag(:i , "" , class: "fa fa-remove").html_safe
		end
	end
end
